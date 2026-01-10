import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborativeControls({ 
  label, 
  children, 
  collaborators = [],
  currentSection 
}) {
  const [activeEditors, setActiveEditors] = useState([]);

  useEffect(() => {
    const editors = collaborators.filter(
      c => c.current_view === currentSection && c.status === 'active'
    );
    setActiveEditors(editors);
  }, [collaborators, currentSection]);

  const hasOtherEditors = activeEditors.length > 0;

  return (
    <div className="relative">
      {hasOtherEditors && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-2 right-0 z-10"
        >
          <Badge className="bg-amber-600 text-white text-xs flex items-center gap-1">
            <User className="w-3 h-3" />
            {activeEditors.length === 1
              ? activeEditors[0].user_name
              : `${activeEditors.length} users`}
            {' editing'}
          </Badge>
        </motion.div>
      )}
      
      <div className={hasOtherEditors ? 'ring-2 ring-amber-500/50 rounded-lg p-2' : ''}>
        {children}
      </div>
    </div>
  );
}