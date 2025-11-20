import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'align'
];

export default function RichTextEditor({ value, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (quillRef.current && readOnly) {
      const editor = quillRef.current.getEditor();
      editor.enable(false);
    }
  }, [readOnly]);

  const getWordCount = () => {
    const text = quillRef.current?.getEditor().getText() || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = () => {
    const text = quillRef.current?.getEditor().getText() || '';
    return text.trim().length;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          className="h-full"
        />
      </div>
      <div className="mt-2 text-sm text-gray-500 flex gap-4 px-2">
        <span>Words: {getWordCount()}</span>
        <span>Characters: {getCharCount()}</span>
      </div>
    </div>
  );
}
