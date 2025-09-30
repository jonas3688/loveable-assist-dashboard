import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
}

export const ImageModal = ({ isOpen, onClose, imageUrl, imageAlt = "Imagem em tamanho maior" }: ImageModalProps) => {
  console.log("ImageModal - isOpen:", isOpen, "imageUrl:", imageUrl);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{imageAlt}</DialogTitle>
        <div className="relative w-full h-full">
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-contain"
            style={{ maxHeight: '85vh' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};