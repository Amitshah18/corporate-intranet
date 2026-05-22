import { FileText, Download } from 'lucide-react';

const MOCK_DOCS = [
  { id: 1, title: 'Employee Handbook 2026', category: 'Policy' },
  { id: 2, title: 'Q2 Engineering Roadmaps', category: 'Engineering' },
  { id: 3, title: 'Travel & Expense Guidelines', category: 'Finance' },
];

export default function KnowledgeBase() {
  return (
    <div className="max-w-4xl mx-auto py-8 font-sans">
      <h1 className="text-2xl font-semibold mb-6 text-primary tracking-tight">Knowledge Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_DOCS.map(doc => (
          <div key={doc.id} className="group border border-border rounded-lg p-4 hover:border-black transition-colors flex items-center justify-between cursor-pointer bg-surface">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-muted rounded">
                <FileText size={18} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary">{doc.title}</h3>
                <span className="text-xs text-gray-500">{doc.category}</span>
              </div>
            </div>
            <Download size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}