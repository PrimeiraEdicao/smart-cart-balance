import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/context/AppContext';
import { Trash2, Edit, Check, X, Tag } from 'lucide-react';
import { Category } from '@/types/shopping';

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions = [
  'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 
  'bg-indigo-500', 'bg-gray-500'
];

export const CategoryManagerDialog = ({ open, onOpenChange }: CategoryManagerDialogProps) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateCategory({ id: editingId, name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5"/> Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4 space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
              <div className={`w-4 h-4 rounded-full ${cat.color}`} />
              {editingId === cat.id ? (
                <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="h-8"/>
              ) : (
                <span className="flex-1">{cat.name}</span>
              )}

              {editingId === cat.id ? (
                <>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveEdit}><Check className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4"/></Button>
                </>
              ) : (
                 <>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEdit(cat)}><Edit className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-4 w-4"/></Button>
                </>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col gap-4 border-t pt-4">
            <div className='space-y-2'>
                <Label>Nova Categoria</Label>
                <div className="flex gap-2">
                    <Input placeholder="Nome da categoria" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    <Button onClick={handleAddCategory}>Adicionar</Button>
                </div>
                <div className="flex gap-2 pt-1">
                    {colorOptions.map(color => (
                        <button key={color} onClick={() => setNewCategoryColor(color)} className={`w-6 h-6 rounded-full ${color} transition-transform hover:scale-110 ${newCategoryColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                    ))}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};