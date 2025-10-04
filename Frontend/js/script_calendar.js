document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const monthYearElement = document.getElementById('currentMonthYear');
    const datesElement = document.getElementById('calendarDates');
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
    
    // 초기 달력 렌더링
    renderCalendar();

    // 백엔드 API 주소 (실제 백엔드 주소로 변경)
    const BACKEND_API_URL = '/api/save-schedule'; 
    
    // ==========================================================
    //  새로운 함수: JSON 변환 및 백엔드 전송 (Fetch API 사용)
    // ==========================================================
    async function sendScheduleToBackend(selectedCell) {
        if (!selectedCell) return;

        // 1. 데이터 수집: 날짜 정보
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = selectedCell.dataset.day;
        
        // 백엔드에서 처리하기 쉬운 'YYYY-MM-DD' 형식으로 날짜 생성
        const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // 2. 데이터 수집: 선택된 할 일 목록
        // 사이드바에서 'selected' 클래스가 붙은 모든 항목을 찾습니다.
        const selectedTasks = document.querySelectorAll('.sidebar-item.selected');
        
        if (selectedTasks.length === 0) {
             alert('선택된 항목이 없습니다.');
             return;
        }
        
        // 선택된 항목의 data-task 값을 배열로 만듭니다. (JSON에 포함될 데이터)
        const tasksArray = Array.from(selectedTasks).map(task => task.dataset.task);

        // 3. JavaScript 객체 생성 (JSON으로 변환할 데이터 구조)
        const scheduleData = {
            date: selectedDate,    // 예: "2025-10-05"
            tasks: tasksArray,     // 예: ["The Day I Woke the Bees", "Harvested Honey Day"]
            // userId: 1, // 필요하다면 사용자 ID 등 추가
        };

        // 4. JSON 변환 및 Fetch 요청
        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST', // 데이터 생성이므로 POST 사용
                headers: {
                    //  서버에게 JSON을 보낸다고 반드시 명시
                    'Content-Type': 'application/json' 
                },
                //  JavaScript 객체를 JSON 문자열로 변환하여 전송
                body: JSON.stringify(scheduleData) 
            });

            if (!response.ok) {
                // 서버 오류 또는 404/500 등의 상태 코드 처리
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            const result = await response.json(); // 서버의 JSON 응답을 객체로 변환
            
            console.log('서버 저장 성공:', result);
            alert(`[${selectedDate}] ${tasksArray.length}개의 일정을 저장했습니다!`);
            
            // 5. 성공 시 화면에 반영 (기존 코드의 DOM 조작 부분)
            const todoListContainer = selectedCell.querySelector('.todo-list');
            selectedTasks.forEach(task => {
                const todoItem = document.createElement('div');
                todoItem.classList.add('todo-item');
                // DOM에 반영할 때도 data-task의 내용을 사용
                todoItem.textContent = task.dataset.task; 
                todoListContainer.appendChild(todoItem);
            });
            
            deactivateSidebar();
            
        } catch (error) {
            console.error('데이터 전송 실패:', error);
            alert(`일정 저장에 실패했습니다. 오류: ${error.message}`);
        }
    }
    // ==========================================================
    // 💡 confirmBtn 클릭 이벤트 리스너 수정
    // ==========================================================
    confirmBtn.addEventListener('click', () => {
        if (!selectedDateCell) return;
        
        //  기존 DOM 조작 로직 대신, JSON 전송 함수 호출
        sendScheduleToBackend(selectedDateCell);
        
        // DOM 조작 로직은 sendScheduleToBackend 함수 내부의 성공 시점에 이동됨.
    });
});