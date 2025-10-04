document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const monthYearElement = document.getElementById('currentMonthYear');
    const datesElement = document.getElementById('calendarDates');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('sidebar');
    const confirmBtn = document.getElementById('confirmBtn');

    let currentDate = new Date(2025, 9, 1);
    let selectedDateCell = null; // 현재 선택된 날짜 칸을 저장할 변수

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        //monthYearElement.textContent = `${year}년 ${month + 1}월`;
        //datesElement.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const lastDate = lastDayOfMonth.getDate();

        // 1일이 시작되기 전 빈 칸
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('date-cell', 'empty');
            datesElement.appendChild(emptyCell);
        }

        // 날짜 칸 생성
        for (let day = 1; day <= lastDate; day++) {
            const dateCell = document.createElement('div');
            dateCell.classList.add('date-cell');
            dateCell.dataset.day = day; // 날짜 정보 저장
            
            const dateNumber = document.createElement('div');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = day;
            
            const todoListContainer = document.createElement('div');
            todoListContainer.classList.add('todo-list');

            dateCell.appendChild(dateNumber);
            dateCell.appendChild(todoListContainer);
            datesElement.appendChild(dateCell);
        }
    }

    // 사이드바 활성화 함수
    function activateSidebar(cell) {
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
        }
        
        selectedDateCell = cell;
        selectedDateCell.classList.add('selected');
        
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    }

    // 사이드바 비활성화 함수
    function deactivateSidebar() {
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
            selectedDateCell = null;
        }
        sidebar.classList.remove('active');
        overlay.style.display = 'none';

        document.querySelectorAll('.sidebar-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // 날짜 칸 클릭 이벤트
    datesElement.addEventListener('click', (event) => {
        const targetCell = event.target.closest('.date-cell');
        if (targetCell && !targetCell.classList.contains('empty')) {
            activateSidebar(targetCell);
        }
    });
    
    // 사이드바 항목 클릭 이벤트
    sidebar.addEventListener('click', (event) => {
        if (!sidebar.classList.contains('active')) return;

        if (event.target.classList.contains('sidebar-item')) {
            event.target.classList.toggle('selected');
        }
    });

    // 확인 버튼 클릭 이벤트
    confirmBtn.addEventListener('click', () => {
        if (!selectedDateCell) return;

        const selectedTasks = document.querySelectorAll('.sidebar-item.selected');
        const todoListContainer = selectedDateCell.querySelector('.todo-list');

        selectedTasks.forEach(task => {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.textContent = task.dataset.task;
            todoListContainer.appendChild(todoItem);
        });

        deactivateSidebar();
    });

    // 오버레이 클릭 시 비활성화
    overlay.addEventListener('click', deactivateSidebar);
    
    // 이전/다음 달 버튼 이벤트
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 초기 달력 렌더링
    renderCalendar();
});