import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const ImageModal = ({ isOpen, onClose, imageUrl, alt }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-auto max-h-[85vh] object-contain"
            onClick={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};