'use client';

import { useState, useEffect, useRef } from 'react';

interface ToDoItem {
  id: string;
  text: string;
  checked: boolean;
}

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<Record<string, ToDoItem>>({});
  const [isToDoMode, setIsToDoMode] = useState(false);
  const [lastEnterTime, setLastEnterTime] = useState<number>(0);
  const [cursorPosition, setCursorPosition] = useState<DOMRect | null>(null);

  // Load todo states from local storage
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  // Save todo states to localSTorage
  useEffect(() => {
      localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Handle formatting actions
  const formatText = (command: string) => {
      document.execCommand(command, false);
  }

  // Handle keypress for todo list feature
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if(!range) return;

    const node = range.startContainer;
    const text = node.textContent || '';
    console.log("parentElement: " + node.parentElement?.closest('.todo-item'));
    const isAtLineStart = range.startOffset === 0 || text.slice(0, text.length-2).trim() === '';
    // Detect [] + Space at line start
    if(event.key === " " && text.endsWith("[]") && isAtLineStart) {
      console.log("I am here.");
      event.preventDefault();
      setIsToDoMode(true);
      
      const todoId = Date.now().toString();
      // Remove []
      const textWithoutBrackets = text.slice(0, -2);
      node.textContent = textWithoutBrackets;
      
      const todoDiv = createTodoElement(todoId);
      range.insertNode(todoDiv);

      setTodos(prev => ({
        ...prev,
        [todoId]: { id: todoId, text: '', checked: false }
      }));

      // Get checkbox and text elements
      const todoText = todoDiv.querySelector('.todo-text') as HTMLElement;
      const checkbox = todoDiv.querySelector('.todo-checkbox') as HTMLElement;
      
      // Create new range and set position after checkbox
      const newRange = document.createRange();
      newRange.setStartAfter(todoText);
      newRange.collapse(true);
      
      // Update selection
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(newRange);
      todoText.focus();
    }

    // Handle Enter key
    if(event.key === 'Enter') {
      const currentTime = Date.now();
      const isDoubleEnter = currentTime - lastEnterTime < 500;
      console.log(lastEnterTime + " " + currentTime + " " + isDoubleEnter + " " + isToDoMode);
      setLastEnterTime(currentTime);

      // Check if we're in a todo item
      const todoItem = node.parentElement?.closest('.todo-item');
      console.log(todoItem);
      if(todoItem && isToDoMode) {
        event.preventDefault();
        
        if (isDoubleEnter) {
          // Remove the last todo item
          todoItem.remove();
          console.log("I am also here.");
          document.execCommand('insertParagraph');
          setLastEnterTime(0);
          setIsToDoMode(false);
          return;
        }

        if(!isDoubleEnter && text.trim() !== '') {
          const newTodoId = Date.now().toString();
          const newItem = createTodoElement(newTodoId);
          todoItem.insertAdjacentElement('afterend', newItem);

          setTodos(prev => ({
            ...prev,
            [newTodoId]: { id: newTodoId, text: '', checked: false }
          }));

          // Get new checkbox and text elements
          const newCheckbox = newItem.querySelector('.todo-checkbox') as HTMLElement;
          const newText = newItem.querySelector('.todo-text') as HTMLElement;
          
          // Set cursor after checkbox
          const newRange = document.createRange();
          newRange.setStartAfter(newText);
          newRange.collapse(true);
          
          // Update selection
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(newRange);
          newText.focus();
        }
      }
    }
  };

const createTodoElement = (todoId: string) => {
    const div = document.createElement('div');
    div.className = 'todo-item';
    div.contentEditable = 'true';
    div.dataset.todoId = todoId;
    div.innerHTML = `
        <input type="checkbox"
                     class="todo-checkbox"
                     data-id="${todoId}"> &nbsp </input>
        <span class="todo-text">      </span>`;
    
    const checkbox = div.querySelector('input');
    checkbox?.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCheckboxClick(todoId, checkbox.checked);
    });
    
    return div;
};

  // Handle to-do checkbox clicks
  const handleCheckboxClick = (todoId: string, checked: boolean) => {
    setTodos(prev => ({
      ...prev,
      [todoId]: { ...prev[todoId], checked }
    }));

    const todoText = document.querySelector(`[data-todo-id="${todoId}"] .todo-text`);
    if (todoText) {
      todoText.classList.toggle('line-through', checked);
    }
  };

  return (
      <div className='max-w-2xl mx-auto p-4 bg-#161515f3 text-white align-middle'>
            <h1 className='text-2xl font-bold mb-4'>Todo List</h1>
          <div className='flex mb-4 gap-2'>
              <button onClick={() => formatText('bold')} className="px-4 py-2 bg-#161515f3 rounded">B</button>
              <button onClick={() => formatText('italic')} className="px-4 py-2 bg-#161515f3 rounded">I</button>
              <button onClick={() => formatText('underline')} className="px-4 py-2 bg-#161515f3 rounded">U</button>
          </div>
          <div 
            ref ={editorRef}
            contentEditable
            className="min-h-[200px] border border-#161515f3 rounded p-4 focus:outline-none bg-#161515f3 text-white"
            onKeyDown={handleKeyDown}
          >
          </div>
      </div>
  );
};

export default Editor;
