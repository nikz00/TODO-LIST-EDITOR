'use client';

import { useState, useEffect, useRef } from 'react';
import HoverToolBar from './toolbar';

interface ToDoItem {
  id: string;
  text: string;
  checked: boolean;
}

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<Record<string, ToDoItem>>({});

  //const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  // const getTodos = () => {
  //   const localStorageTodos = localStorage.getItem('todos');
  //   if(localStorageTodos) {
  //     setTodos(JSON.parse(localStorageTodos));
  //   } else {
  //     setTodos([]);
  //   }
  // }

  // useEffect(() => {
  //   getTodos();
  // }, []);

  // const createTodo = () => {
  //   const localStorageTodos = localStorage.getItem('todos');
  //   const newTodoItem = {
  //     id: Date.now().toString(),
  //     text: newTodo,
  //     checked: false
  //   };
  //   if(!localStorageTodos) {
  //     localStorage.setItem('todos', JSON.stringify([newTodoItem]));
  //   } else {
  //     const todos = JSON.parse(localStorageTodos);
  //     todos.push(newTodoItem);
  //     localStorage.setItem('todos', JSON.stringify(todos));
  //   }
  //   setNewTodoText("");
  //   getTodos();
  // }
  // const updateTodo = (id: number) => {}
  // const deleteTodo = (id: number) => {}
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

  const getParentElementByTodoId = (todoId: string): HTMLElement | null => {
    return document.querySelector(`[data-todo-id="${todoId}"]`);
  };

  // Handle keypress for todo list feature
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if(!range) return;

    const node = range.startContainer;
    const text = node.textContent || '';
    console.log("parentElement: " + node.parentElement);
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
      const todoItems = document.querySelectorAll('.todo-item');
      const lastTodoItem = todoItems[todoItems.length - 1];
      console.log(lastTodoItem);
      if(lastTodoItem && isToDoMode) {
        event.preventDefault();
        
        if (isDoubleEnter && text.trim() === '') {
          // Remove the last todo item
          lastTodoItem.remove();
          console.log("I am also here.");
          if(isDoubleEnter) {
            document.execCommand('insertParagraph');
          }
          setLastEnterTime(0);
          setIsToDoMode(false);
          return;
        }

        if(!isDoubleEnter && text.trim() !== '') {
          const newTodoId = Date.now().toString();
          const newItem = createTodoElement(newTodoId);
          lastTodoItem.insertAdjacentElement('afterend', newItem);

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
        <label class="todo-text"></label>`;
    
    const checkbox = div.querySelector('input');
    checkbox?.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCheckboxClick(todoId, checkbox.checked || false);
    });

    return div;
};

  // Handle to-do checkbox clicks
  const handleCheckboxClick = (todoId: string, checked: boolean) => {
    console.log("function called");
    setTodos(prev => ({
      ...prev,
      [todoId]: { ...prev[todoId], checked }
    }));

    const todoText = document.querySelector(`[data-todo-id="${todoId}"] .todo-text`) as HTMLElement;
    console.log(todoText);
    if (todoText) {
        todoText.style.textDecoration = checked ? 'line-through' : 'none';
    }
  };

  return (
      <div className='max-w-2xl mx-auto p-4 bg-#161515f3 text-white align-middle'>
            <h1 className='text-2xl font-bold mb-4'>Todo List</h1>
          {/* <div className='flex mb-4 gap-2'>
              <button onClick={() => formatText('bold')} className="px-4 py-2 bg-#161515f3 rounded">B</button>
              <button onClick={() => formatText('italic')} className="px-4 py-2 bg-#161515f3 rounded">I</button>
              <button onClick={() => formatText('underline')} className="px-4 py-2 bg-#161515f3 rounded">U</button>
          </div> */}
          <HoverToolBar toolBarRef={editorRef} />
          <div 
            ref ={editorRef}
            contentEditable
            className="min-h-[200px] border-#161515f3 rounded p-4 focus:outline-none bg-#161515f3 text-white"
            onKeyDown={handleKeyDown}
          >
            
          </div>
      </div>
  );
};

export default Editor;
