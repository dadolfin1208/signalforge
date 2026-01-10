import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PresenceIndicator({ collaborators = [] }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const activeUsers = collaborators.filter(c => c.status === 'active');

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">
          {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
        </span>
      </div>
      
      <div className="flex -space-x-2">
        <AnimatePresence>
          {collaborators.slice(0, 5).map((collab, index) => (
            <motion.div
              key={collab.user_email}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Avatar className="w-8 h-8 border-2 border-slate-900">
                <AvatarFallback className="text-xs bg-indigo-600 text-white">
                  {getInitials(collab.user_name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${getStatusColor(collab.status)}`} />
              
              {collab.current_view && (
                <div className="absolute -top-1 -right-1">
                  <Eye className="w-3 h-3 text-indigo-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {collaborators.length > 5 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 text-xs text-white">
            +{collaborators.length - 5}
          </div>
        )}
      </div>

      {collaborators.length > 0 && (
        <div className="hidden md:flex items-center gap-1 ml-2">
          {collaborators.slice(0, 3).map((collab) => (
            <Badge key={collab.user_email} variant="outline" className="text-xs border-slate-600 text-slate-300">
              {collab.user_name}
              {collab.current_view && (
                <span className="ml-1 text-slate-500">• {collab.current_view}</span>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}