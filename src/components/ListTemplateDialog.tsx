import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BookTemplate, Plus, Trash2 } from "lucide-react";
import { ListTemplate, ListItem, TemplateItem } from "@/types/shopping"; // Importar TemplateItem
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";

interface ListTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ListTemplateDialog = ({ open, onOpenChange }: ListTemplateDialogProps) => {
  const { items: currentItems, addItem } = useAppContext();
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const [templates, setTemplates] = useState<ListTemplate[]>(() => {
    const savedTemplates = localStorage.getItem("shoppingListTemplates");
    return savedTemplates ? JSON.parse(savedTemplates) : [];
  });
  
  const onCreateFromTemplate = (template: ListTemplate) => {
      template.items.forEach(item => {
          addItem(item);
      });
      toast.info(`Itens do modelo "${template.name}" foram adicionados à sua lista.`);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("O nome do modelo não pode estar vazio.");
      return;
    }

    // CORRIGIDO: Agora cria um array de `TemplateItem`
    const newTemplate: ListTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      items: currentItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        categoryId: item.categoryId
      }))
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem("shoppingListTemplates", JSON.stringify(updatedTemplates));
    
    setTemplateName("");
    setTemplateDescription("");
    setMode('list');
    toast.success("Modelo salvo com sucesso!");
  };

  const handleUseTemplate = (template: ListTemplate) => {
    onCreateFromTemplate(template);
    onOpenChange(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem("shoppingListTemplates", JSON.stringify(updatedTemplates));
    toast.error("Modelo removido.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookTemplate className="h-5 w-5 text-blue-600" />
            <span>
              {mode === 'create' ? 'Salvar Como Modelo' : 'Modelos de Lista'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-1">
          {mode === 'list' && (
            <>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setMode('create')}
                  className="flex-1"
                  disabled={currentItems.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Salvar Lista Atual
                </Button>
              </div>

              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {template.items.length} itens
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="w-full"
                      >
                        Usar Este Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookTemplate className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <div>Nenhum modelo salvo</div>
                  <div className="text-sm">Salve sua lista atual como modelo!</div>
                </div>
              )}
            </>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nome do Modelo</Label>
                <Input
                  id="templateName"
                  placeholder="Ex: Lista Básica Semanal"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="templateDescription">Descrição (opcional)</Label>
                <Textarea
                  id="templateDescription"
                  placeholder="Descrição do modelo..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Itens que serão salvos ({currentItems.length}):
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentItems.map((item, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {item.name} ({item.quantity})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setMode('list')} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleSaveTemplate} 
                  className="flex-1"
                  disabled={!templateName.trim()}
                >
                  Salvar Modelo
                </Button>
              </div>
            </div>
          )}
        </div>

        {mode === 'list' && (
          <div className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};