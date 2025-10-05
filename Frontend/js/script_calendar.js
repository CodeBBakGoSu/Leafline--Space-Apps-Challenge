document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 캘린더 스크립트 로드됨');
    
    // DOM 요소 가져오기
    const datesElement = document.getElementById('calendarDates');
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('sidebar');
    const confirmBtn = document.getElementById('confirmBtn');
    
    console.log('🔍 DOM 요소 확인:', { datesElement, overlay, sidebar, confirmBtn });

    let currentDate = new Date(2025, 9, 1);
    let selectedDateCell = null; // 현재 선택된 날짜 칸을 저장할 변수

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        console.log('🗓️ 캘린더 렌더링 시작:', year, month + 1);
        console.log('📅 datesElement:', datesElement);

        // 기존 날짜 칸들 제거
        datesElement.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const lastDate = lastDayOfMonth.getDate();

        console.log('📊 캘린더 정보:', { firstDayOfWeek, lastDate });

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
        
        console.log('✅ 캘린더 렌더링 완료! 총 날짜 칸:', datesElement.children.length);
    }

    // 사이드바 활성화 함수
    function activateSidebar(cell) {
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
        }
        
        selectedDateCell = cell;
        selectedDateCell.classList.add('selected');
        
        // 캘린더와 헤더에서 expanded 클래스 제거 (줄어들게)
        const calendarContainer = document.querySelector('.calendar-container');
        const header = document.querySelector('.header');
        const monthButton = document.querySelector('.calendar-header img');
        
        if (calendarContainer) calendarContainer.classList.remove('expanded');
        if (header) header.classList.remove('expanded');
        if (monthButton) monthButton.classList.remove('expanded'); // 월 버튼 원래 위치로
        if (overlay) overlay.classList.remove('expanded'); // overlay 원래 크기로
        
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    }

    // 사이드바 비활성화 함수
    function deactivateSidebar() {
        if (selectedDateCell) {
            selectedDateCell.classList.remove('selected');
            selectedDateCell = null;
        }
        
        // 캘린더와 헤더에 expanded 클래스 추가 (늘어나게)
        const calendarContainer = document.querySelector('.calendar-container');
        const header = document.querySelector('.header');
        const monthButton = document.querySelector('.calendar-header img');
        
        if (calendarContainer) calendarContainer.classList.add('expanded');
        if (header) header.classList.add('expanded');
        if (monthButton) monthButton.classList.add('expanded'); // 월 버튼 오른쪽으로 이동
        if (overlay) overlay.classList.add('expanded'); // overlay 확장
        
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
    console.log('🎯 초기 캘린더 렌더링 시작');
    renderCalendar();
    
    // 초기 상태에서 캘린더와 헤더 확장
    const calendarContainer = document.querySelector('.calendar-container');
    const header = document.querySelector('.header');
    const monthButton = document.querySelector('.calendar-header img');
    
    if (calendarContainer) calendarContainer.classList.add('expanded');
    if (header) header.classList.add('expanded');
    if (monthButton) monthButton.classList.add('expanded'); // 초기 상태에서 월 버튼 오른쪽으로
    if (overlay) overlay.classList.add('expanded'); // 초기 상태에서 overlay 확장
    
    // 꽃 이벤트 추가 함수
    function addFlowerEvents() {
        // 11일 - Cosmos Bloom
        const day11Cell = document.querySelector('.date-cell[data-day="11"]');
        if (day11Cell) {
            const todoListContainer = day11Cell.querySelector('.todo-list');
            if (todoListContainer) {
                const cosmosEvent = document.createElement('div');
                cosmosEvent.classList.add('todo-item');
                cosmosEvent.innerHTML = '<img src="../img/Calendar/calendar_flower_icon1.png" alt="Cosmos Bloom" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;"> Cosmos Bloom';
                cosmosEvent.style.backgroundColor = '#FFB6C1'; // 분홍색 배경
                cosmosEvent.style.color = '#8B008B'; // 진한 보라색 글자
                todoListContainer.appendChild(cosmosEvent);
                console.log('🌸 Cosmos Bloom 이벤트 추가됨 (11일)');
            }
        }
        
        // 27일 - Acasia Bloom
        const day27Cell = document.querySelector('.date-cell[data-day="27"]');
        if (day27Cell) {
            const todoListContainer = day27Cell.querySelector('.todo-list');
            if (todoListContainer) {
                const acasiaEvent = document.createElement('div');
                acasiaEvent.classList.add('todo-item');
                acasiaEvent.innerHTML = '<img src="../img/Calendar/calendar_flower_icon2.png" alt="Acasia Bloom" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;"> Acasia Bloom';
                acasiaEvent.style.backgroundColor = '#98FB98'; // 연한 녹색 배경
                acasiaEvent.style.color = '#006400'; // 진한 녹색 글자
                todoListContainer.appendChild(acasiaEvent);
                console.log('🌿 Acasia Bloom 이벤트 추가됨 (27일)');
            }
        }
    }
    
    // 꽃 이벤트 추가 (캘린더 렌더링 후 실행)
    setTimeout(addFlowerEvents, 100);

    // 백엔드 API 주소
    const BACKEND_API_URL = '/api/calendar/schedule'; // Vercel 프록시 사용 
    
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
        confirmBtn.textContent = 'AI analyzing...'; // 로딩 텍스트
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
    // 💡 confirmBtn 클릭 이벤트 리스너
    // ==========================================================
    confirmBtn.addEventListener('click', () => {
        if (!selectedDateCell) return;
        
        // JSON 전송 함수 호출
        sendScheduleToBackend(selectedDateCell);
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