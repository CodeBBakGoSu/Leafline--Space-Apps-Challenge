/**
 * ========================================
 * TODO List Module (Horizontal Scroll)
 * ========================================
 * 
 * TODO 리스트 관리 및 UI 인터랙션
 */

/* ================================
   전역 변수
================================ */

let isInputMode = false; // 입력 모드 상태

/* ================================
   DOM 요소
================================ */

const addContainer = document.getElementById('addContainer');
const addBtn = document.getElementById('addBtn');
const todoInput = document.getElementById('todoInput');
const aiBtn = document.getElementById('aiBtn');
const todoList = document.getElementById('todoList');
const completedCountEl = document.getElementById('completedCount');
const totalCountEl = document.getElementById('totalCount');
const aiOptionsContainer = document.getElementById('aiOptionsContainer');
const aiOptionsList = document.getElementById('aiOptionsList');

/* ================================
   초기화
================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 초기 카운트 업데이트
    updateCount();
    
    // 체크 버튼 이벤트 등록
    attachCheckButtonEvents();
    
    console.log('✅ TODO List 초기화 완료 (가로 스크롤 모드)');
});

/* ================================
   + 버튼 클릭 (입력 모드 전환)
================================ */

/**
 * + 버튼 클릭 시 입력 모드로 전환 또는 TODO 추가/닫기
 */
addBtn.addEventListener('click', () => {
    if (!isInputMode) {
        // 입력 모드로 전환
        enterInputMode();
    } else {
        // 입력 모드 종료 (+ 버튼이 X로 회전되어 있음)
        exitInputMode();
    }
});

/**
 * 입력 모드 진입
 */
function enterInputMode() {
    isInputMode = true;
    
    // 1. 컨테이너 확장
    addContainer.classList.remove('circle');
    addContainer.classList.add('expanded');
    
    // 2. 입력창 표시
    setTimeout(() => {
        todoInput.style.display = 'block';
        todoInput.focus();
    }, 200);
    
    // 3. AI 버튼 표시
    setTimeout(() => {
        aiBtn.style.display = 'block';
        aiBtn.classList.add('show');
    }, 100);
    
    console.log('📝 입력 모드 진입 (+ → X)');
}

/**
 * 입력 모드 종료
 */
function exitInputMode() {
    isInputMode = false;
    
    // 1. AI 옵션 영역 숨김
    hideAIOptions();
    
    // 2. AI 버튼 숨김
    aiBtn.classList.remove('show');
    setTimeout(() => {
        aiBtn.style.display = 'none';
    }, 300);
    
    // 3. 입력창 숨김
    todoInput.style.display = 'none';
    todoInput.value = '';
    
    // 4. 컨테이너 축소
    addContainer.classList.remove('expanded');
    addContainer.classList.add('circle');
    
    console.log('❌ 입력 모드 종료 (X → +)');
}

/* ================================
   Enter 키로 TODO 추가
================================ */

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

/* ================================
   TODO 추가 (맨 앞에 추가)
================================ */

/**
 * 새로운 TODO 항목 추가 (맨 앞에)
 */
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    // TODO 항목 생성
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item adding';
    todoItem.setAttribute('data-completed', 'false');
    
    todoItem.innerHTML = `
        <div class="todo-content">
            <h3 class="todo-task-title">${text}</h3>
        </div>
        <button class="todo-check-btn">
            <img src="../img/to_do_list/todo_btn_unchecked.png" alt="unchecked">
        </button>
    `;
    
    // 리스트의 맨 앞에 추가
    todoList.insertBefore(todoItem, todoList.firstChild);
    
    // 애니메이션 클래스 제거
    setTimeout(() => {
        todoItem.classList.remove('adding');
    }, 400);
    
    // 맨 앞으로 스크롤
    setTimeout(() => {
        todoList.scrollLeft = 0;
    }, 100);
    
    // 체크 버튼 이벤트 등록
    const checkBtn = todoItem.querySelector('.todo-check-btn');
    checkBtn.addEventListener('click', () => toggleTodo(todoItem, checkBtn));
    
    // 카운트 업데이트
    updateCount();
    
    // 입력 모드 종료
    exitInputMode();
    
    console.log(`✅ TODO 추가 (맨 앞): ${text}`);
}

/* ================================
   AI 추천 버튼
================================ */

/**
 * AI로 TODO 3가지 옵션 받기
 */
aiBtn.addEventListener('click', async () => {
    const userInput = todoInput.value.trim();
    console.log('🤖 AI 추천 요청...', userInput ? `context: "${userInput}"` : '(일반 추천)');
    
    // 로딩 표시
    aiBtn.style.opacity = '0.5';
    aiBtn.style.cursor = 'wait';
    
    try {
        // 백엔드 API 호출 (사용자 입력을 context로 전달)
        const url = userInput 
            ? `/api/todolist/ai-todos?context=${encodeURIComponent(userInput)}`
            : '/api/todolist/ai-todos'; // Vercel 프록시 사용
        
        const response = await fetch(url);
        const aiTodos = await response.json();
        
        console.log('✅ AI 추천 받음:', aiTodos);
        
        // AI 옵션 표시
        showAIOptions(aiTodos);
        
    } catch (error) {
        console.error('❌ AI 추천 실패:', error);
        alert('AI recommendation failed. Please try again.');
    } finally {
        // 로딩 상태 해제
        aiBtn.style.opacity = '1';
        aiBtn.style.cursor = 'pointer';
    }
});

/**
 * AI 추천 옵션 표시
 */
function showAIOptions(todos) {
    // 기존 옵션 제거
    aiOptionsList.innerHTML = '';
    
    // 3개의 옵션 생성
    todos.forEach((todo) => {
        const optionItem = document.createElement('button');
        optionItem.className = 'ai-option-item';
        optionItem.textContent = todo.content;
        optionItem.dataset.todoContent = todo.content;
        
        // 클릭 시 TODO 리스트에 추가
        optionItem.addEventListener('click', () => {
            // 이미 선택된 항목이면 무시
            if (optionItem.classList.contains('selected')) {
                return;
            }
            
            // 선택 표시 (불투명하게 유지)
            optionItem.classList.add('selected');
            
            // TODO 리스트에 추가
            addTodoFromAI(todo.content);
        });
        
        aiOptionsList.appendChild(optionItem);
    });
    
    // 옵션 컨테이너 표시
    aiOptionsContainer.style.display = 'block';
    setTimeout(() => {
        aiOptionsContainer.classList.add('show');
    }, 10);
    
    console.log('📋 AI 옵션 3개 표시됨 (중복 선택 가능)');
}

/**
 * AI 추천 옵션 숨김
 */
function hideAIOptions() {
    aiOptionsContainer.classList.remove('show');
    setTimeout(() => {
        aiOptionsContainer.style.display = 'none';
        aiOptionsList.innerHTML = '';
    }, 400);
}

/**
 * AI 추천에서 TODO 추가
 */
function addTodoFromAI(content) {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item adding';
    todoItem.setAttribute('data-completed', 'false');
    
    todoItem.innerHTML = `
        <div class="todo-content">
            <h3 class="todo-task-title">${content}</h3>
        </div>
        <button class="todo-check-btn">
            <img src="../img/to_do_list/todo_btn_unchecked.png" alt="unchecked">
        </button>
    `;
    
    // 맨 앞에 추가
    todoList.insertBefore(todoItem, todoList.firstChild);
    
    // 애니메이션 클래스 제거
    setTimeout(() => {
        todoItem.classList.remove('adding');
    }, 400);
    
    // 맨 앞으로 스크롤
    setTimeout(() => {
        todoList.scrollLeft = 0;
    }, 100);
    
    // 체크 버튼 이벤트 등록
    const checkBtn = todoItem.querySelector('.todo-check-btn');
    checkBtn.addEventListener('click', () => toggleTodo(todoItem, checkBtn));
    
    // 카운트 업데이트
    updateCount();
    
    console.log(`✅ AI TODO 추가: ${content}`);
}

/* ================================
   TODO 체크/언체크 (맨 뒤로 이동)
================================ */

/**
 * 체크 버튼 이벤트 등록
 */
function attachCheckButtonEvents() {
    const checkButtons = document.querySelectorAll('.todo-check-btn');
    checkButtons.forEach(btn => {
        const todoItem = btn.closest('.todo-item');
        btn.addEventListener('click', () => toggleTodo(todoItem, btn));
    });
}

/**
 * TODO 체크 상태 토글 및 맨 뒤로 이동
 * 
 * @param {HTMLElement} todoItem - TODO 항목 요소
 * @param {HTMLElement} checkBtn - 체크 버튼 요소
 */
function toggleTodo(todoItem, checkBtn) {
    const isCompleted = todoItem.getAttribute('data-completed') === 'true';
    
    if (!isCompleted) {
        // 체크 → 맨 뒤로 이동
        todoItem.setAttribute('data-completed', 'true');
        checkBtn.classList.add('checked');
        checkBtn.querySelector('img').src = '../img/to_do_list/todo_btn_checked.png';
        
        // 이동 애니메이션
        todoItem.classList.add('moving');
        
        setTimeout(() => {
            // DOM에서 제거하고 맨 뒤에 추가
            todoList.removeChild(todoItem);
            todoList.appendChild(todoItem);
            todoItem.classList.remove('moving');
            
            // 맨 뒤로 스크롤
            setTimeout(() => {
                todoList.scrollLeft = todoList.scrollWidth;
            }, 100);
        }, 500);
        
        console.log('✅ TODO 완료 → 맨 뒤로 이동');
        
    } else {
        // 언체크 → 그자리 유지
        todoItem.setAttribute('data-completed', 'false');
        checkBtn.classList.remove('checked');
        checkBtn.querySelector('img').src = '../img/to_do_list/todo_btn_unchecked.png';
        console.log('⬜ TODO 미완료');
    }
    
    // 카운트 업데이트
    updateCount();
}

/* ================================
   카운트 업데이트
================================ */

/**
 * 완료/전체 카운트 업데이트
 */
function updateCount() {
    const allTodos = document.querySelectorAll('.todo-item');
    const completedTodos = document.querySelectorAll('.todo-item[data-completed="true"]');
    
    totalCountEl.textContent = allTodos.length;
    completedCountEl.textContent = completedTodos.length;
}

/* ================================
   가로 스크롤 편의 기능
================================ */

// 마우스 휠로 가로 스크롤
todoList.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
        e.preventDefault();
        todoList.scrollLeft += e.deltaY;
    }
});