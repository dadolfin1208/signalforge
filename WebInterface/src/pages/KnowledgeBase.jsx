import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Video, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const { data: articles = [] } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: () => base44.entities.KnowledgeArticle.filter({ is_published: true }, 'order'),
  });

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'getting_started', label: 'Getting Started' },
    { value: 'recording', label: 'Recording' },
    { value: 'mixing', label: 'Mixing' },
    { value: 'mastering', label: 'Mastering' },
    { value: 'ai_features', label: 'AI Features' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'plugins', label: 'Plugins' },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          ← Back to Knowledge Base
        </button>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-white mb-2">{selectedArticle.title}</CardTitle>
                <Badge className="bg-indigo-600">
                  {categories.find(c => c.value === selectedArticle.category)?.label}
                </Badge>
              </div>
              {selectedArticle.video_url && (
                <Video className="w-6 h-6 text-indigo-400" />
              )}
            </div>
          </CardHeader>
          <CardContent className="prose prose-invert prose-indigo max-w-none">
            {selectedArticle.video_url && (
              <div className="mb-6">
                <iframe
                  src={selectedArticle.video_url}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Knowledge Base</h1>
        <p className="text-xl text-slate-400">Learn everything about Signal Forge by Genius Ideas</p>
        <p className="text-sm text-slate-500 mt-1">Designed by Barry and Judah</p>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for tutorials, guides, and tips..."
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => setSelectedArticle(article)}
              className="bg-slate-800/50 border-slate-700 hover:border-indigo-500 transition-all cursor-pointer h-full"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {article.video_url && (
                    <Video className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <CardTitle className="text-lg text-white">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600">
                  {categories.find(c => c.value === article.category)?.label}
                </Badge>
                <p className="text-sm text-slate-400 mt-3 line-clamp-3">
                  {article.content.substring(0, 120)}...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-16 text-center">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                <p className="text-slate-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'Articles coming soon!'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}