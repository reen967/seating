import React, { useState, useRef, useEffect } from 'react';
import { LectureTheatre, SeatNode } from '../../types';
import { storageService } from '../../services/storage';
import { v4 as uuidv4 } from 'uuid'; // In a real app we'd use uuid lib, here using a simple random generator if needed or just use crypto.randomUUID()

const generateId = () => Math.random().toString(36).substring(2, 9);

interface LtBuilderProps {
  onBack: () => void;
}

export const LtBuilder: React.FC<LtBuilderProps> = ({ onBack }) => {
  const [lts, setLts] = useState<LectureTheatre[]>(storageService.getLTs());
  const [selectedLtId, setSelectedLtId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nodes, setNodes] = useState<SeatNode[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Canvas refs
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentLt = lts.find(l => l.id === selectedLtId);

  useEffect(() => {
    if (currentLt) {
      setName(currentLt.name);
      setNodes(currentLt.layoutMatrix);
    } else {
      setName('');
      setNodes([]);
    }
  }, [currentLt]);

  const handleCreateNew = () => {
    const newId = generateId();
    const newLt: LectureTheatre = { id: newId, name: 'New Lecture Theatre', layoutMatrix: [] };
    storageService.saveLT(newLt);
    setLts([...lts, newLt]);
    setSelectedLtId(newId);
  };

  const handleSave = () => {
    if (selectedLtId) {
      const updatedLt: LectureTheatre = {
        id: selectedLtId,
        name,
        layoutMatrix: nodes,
      };
      storageService.saveLT(updatedLt);
      // refresh list locally
      setLts(lts.map(l => l.id === selectedLtId ? updatedLt : l));
      alert('Layout saved!');
    }
  };

  const addNode = () => {
    const newNode: SeatNode = {
      id: generateId(),
      label: `S${nodes.length + 1}`,
      x: 50,
      y: 50,
      type: 'standard'
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(nodes.filter(n => n.id !== id));
  };

  const toggleType = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(nodes.map(n => n.id === id ? { ...n, type: n.type === 'standard' ? 'swop' : 'standard' } : n));
  };

  // Drag and Drop Logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      });
    }
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Snap to grid (optional, makes it cleaner)
    const snappedX = Math.round(newX / 10) * 10;
    const snappedY = Math.round(newY / 10) * 10;

    setNodes(nodes.map(n => n.id === draggingId ? { ...n, x: Math.max(0, snappedX), y: Math.max(0, snappedY) } : n));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium">← Back</button>
          <h2 className="text-xl font-bold text-gray-800">Lecture Theatre Builder</h2>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded px-3 py-2 bg-gray-50 text-gray-800"
            value={selectedLtId || ''} 
            onChange={(e) => setSelectedLtId(e.target.value)}
          >
            <option value="">Select LT to Edit...</option>
            {lts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button onClick={handleCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ New LT</button>
        </div>
      </div>

      {selectedLtId ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Controls */}
          <div className="w-64 bg-white border-r p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Theatre Name</label>
              <input 
                type="text" 
                className="mt-1 w-full border rounded p-2" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Tools</p>
              <button 
                onClick={addNode}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded border border-gray-300 flex items-center justify-center gap-2"
              >
                <span>🪑</span> Add Seat
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Drag seats to position.<br/>
                Double-click label to edit.<br/>
                Right-click to toggle Swop/Standard.<br/>
                Click 'X' to remove.
              </p>
            </div>

            <div className="mt-auto">
              <button onClick={handleSave} className="w-full bg-green-600 text-white py-3 rounded font-bold shadow hover:bg-green-700">
                Save Layout
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div 
            className="flex-1 bg-slate-100 overflow-auto relative canvas-container cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             <div 
                ref={canvasRef}
                className="relative bg-white shadow-lg mx-auto mt-10"
                style={{ width: '800px', height: '600px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
             >
                <div className="absolute top-2 left-2 text-gray-300 font-bold text-4xl pointer-events-none select-none">FRONT</div>
                
                {nodes.map(node => (
                  <div
                    key={node.id}
                    className={`absolute w-12 h-12 rounded-lg flex items-center justify-center shadow-md cursor-move border-2 select-none transition-colors 
                      ${node.type === 'swop' ? 'bg-yellow-100 border-yellow-400' : 'bg-blue-50 border-blue-300'}
                      ${draggingId === node.id ? 'z-50 scale-110 shadow-xl' : 'z-10'}
                    `}
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onContextMenu={(e) => { e.preventDefault(); toggleType(node.id, e); }}
                  >
                    <input 
                      className="bg-transparent text-center w-full font-bold text-xs focus:outline-none text-gray-700"
                      value={node.label}
                      onChange={(e) => handleLabelChange(node.id, e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()} // Allow clicking input without dragging
                    />
                    <button 
                      onClick={(e) => deleteNode(node.id, e)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
          <p>Select a Lecture Theatre or create a new one to start editing.</p>
        </div>
      )}
    </div>
  );
};