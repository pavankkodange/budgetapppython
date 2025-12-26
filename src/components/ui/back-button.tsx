import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => navigate('/')}
      aria-label="Back to home"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}