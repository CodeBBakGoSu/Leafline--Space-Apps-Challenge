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
        // AI 예측 일정을 클릭했는지 확인
        const aiPredictedItem = event.target.closest('.todo-item.ai-predicted');
        
        if (aiPredictedItem) {
            // AI 예측 일정 클릭 → 사용자 확인으로 간주하고 진하게 표시
            aiPredictedItem.classList.remove('ai-predicted');
            console.log('✅ AI 예측 일정 확인됨:', aiPredictedItem.textContent);
            return; // 사이드바는 열지 않음
        }
        
        // 일반 일정이 아닌 빈 공간 클릭 시 사이드바 열기
        const todoItem = event.target.closest('.todo-item');
        if (!todoItem) {
            const targetCell = event.target.closest('.date-cell');
            if (targetCell && !targetCell.classList.contains('empty')) {
                activateSidebar(targetCell);
            }
        }
    });
    
    // 사이드바 항목 클릭 이벤트 (토글 가능)
    sidebar.addEventListener('click', (event) => {
        if (!sidebar.classList.contains('active')) return;

        // 클릭한 요소나 부모 요소에서 sidebar-item 찾기
        const sidebarItem = event.target.closest('.sidebar-item');
        
        if (sidebarItem) {
            // 선택/선택 해제 토글
            sidebarItem.classList.toggle('selected');
        }
    });

    // 오버레이 클릭 시 비활성화
    overlay.addEventListener('click', deactivateSidebar);
    
    // 초기 달력 렌더링
    renderCalendar();

    // 백엔드 API 주소
    const BACKEND_API_URL = 'http://localhost:8000/api/calendar/schedule'; 
    
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
             console.log('선택된 항목이 없습니다.');
             return;
        }
        
        // 선택된 항목의 data-task 값을 배열로 만듭니다. (JSON에 포함될 데이터)
        const tasksArray = Array.from(selectedTasks).map(task => task.dataset.task);

        // 3. JavaScript 객체 생성 (JSON으로 변환할 데이터 구조)
        const scheduleData = {
            date: selectedDate,    // 예: "2025-10-05"
            tasks: tasksArray,     // 예: ["The Day I Woke the Bees", "Harvested Honey Day"]
        };

        // 4. 로딩 상태 표시
        confirmBtn.disabled = true;
        const originalBtnText = confirmBtn.textContent;
        confirmBtn.textContent = 'AI 분석 중...';
        confirmBtn.style.opacity = '0.6';

        // 4. JSON 변환 및 Fetch 요청
        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(scheduleData) 
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('✅ 서버 응답 성공:', result);
            
            // 5. 백엔드에서 받은 모든 일정을 캘린더에 표시
            if (result.response && Array.isArray(result.response)) {
                console.log('📅 받은 일정 개수:', result.response.length);
                console.log('📋 일정 상세:', result.response);
                
                renderSchedulesFromBackend(result.response);
                
                const aiCount = result.response.filter(item => item.AI).length;
                const userCount = result.response.filter(item => !item.AI).length;
                
                console.log(`✨ 일정 저장 완료! 사용자: ${userCount}개, AI 예측: ${aiCount}개`);
                
                // 사이드바 닫기
                setTimeout(() => {
                    deactivateSidebar();
                }, 300);
            } else {
                console.log('⚠️ 응답 형식 오류:', result);
                deactivateSidebar();
            }
            
        } catch (error) {
            console.error('❌ 데이터 전송 실패:', error);
        } finally {
            // 로딩 상태 해제
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalBtnText;
            confirmBtn.style.opacity = '1';
        }
    }
    // ==========================================================
    // 💡 새로운 함수: 백엔드에서 받은 일정을 캘린더에 렌더링
    // ==========================================================
    function renderSchedulesFromBackend(schedules) {
        console.log('🔄 renderSchedulesFromBackend 호출됨');
        console.log('받은 일정:', schedules);
        
        // 먼저 모든 기존 일정 제거
        document.querySelectorAll('.todo-item').forEach(item => item.remove());
        
        // 날짜별로 그룹화
        const schedulesByDate = {};
        schedules.forEach(schedule => {
            if (!schedulesByDate[schedule.date]) {
                schedulesByDate[schedule.date] = [];
            }
            schedulesByDate[schedule.date].push(schedule);
        });
        
        console.log('날짜별 그룹:', schedulesByDate);
        
        // 각 날짜의 일정을 캘린더에 추가
        Object.keys(schedulesByDate).forEach(dateStr => {
            // dateStr 예: "2025-10-05"
            const [year, month, day] = dateStr.split('-').map(Number);
            
            console.log(`처리 중: ${dateStr} (${year}-${month}-${day})`);
            console.log(`현재 달력: ${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`);
            
            // 현재 표시된 달과 같은지 확인
            if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
                // 해당 날짜 셀 찾기
                const dateCell = document.querySelector(`.date-cell[data-day="${day}"]`);
                
                console.log(`날짜 ${day}일 셀 찾기:`, dateCell ? '성공' : '실패');
                
                if (dateCell) {
                    const todoListContainer = dateCell.querySelector('.todo-list');
                    console.log('할일 컨테이너:', todoListContainer ? '발견' : '없음');
                    
                    // 해당 날짜의 모든 일정 추가
                    schedulesByDate[dateStr].forEach(schedule => {
                        const todoItem = document.createElement('div');
                        todoItem.classList.add('todo-item');
                        todoItem.textContent = schedule.task;
                        
                        // AI 예측 일정이면 반투명 스타일 추가
                        if (schedule.AI) {
                            todoItem.classList.add('ai-predicted');
                            console.log(`  ➕ AI 예측: ${schedule.task}`);
                        } else {
                            console.log(`  ➕ 사용자: ${schedule.task}`);
                        }
                        
                        todoListContainer.appendChild(todoItem);
                    });
                } else {
                    console.log(`⚠️ 날짜 셀을 찾을 수 없음: ${day}일`);
                }
            } else {
                console.log(`⏭️ 다른 달의 일정 건너뜀: ${dateStr}`);
            }
        });
        
        console.log('✅ 렌더링 완료');
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
    
    // ==========================================================
    // 💡 페이지 로드 시 기존 일정 불러오기 (선택사항)
    // ==========================================================
    async function loadExistingSchedules() {
        try {
            const response = await fetch(`${BACKEND_API_URL}?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.response) {
                    renderSchedulesFromBackend(result.response);
                }
            }
        } catch (error) {
            console.log('기존 일정 불러오기 실패:', error);
        }
    }
    
    // 초기 로드
    // loadExistingSchedules(); // 필요시 주석 해제
});