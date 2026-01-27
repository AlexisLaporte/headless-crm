import { Sparkles } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  feature: string;
}

export function AiUpsellModal({ open, onClose, feature }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Fonctionnalite IA</h3>
        <p className="text-gray-500 mb-1">{feature}</p>
        <p className="text-sm text-gray-400 mb-6">
          Activez le compte paiement pour debloquer les fonctionnalites d'intelligence artificielle.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            Activer le compte paiement
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
