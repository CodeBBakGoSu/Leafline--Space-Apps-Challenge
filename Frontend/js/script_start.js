<script>
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 'start' 버튼 요소를 찾습니다.
        const startButton = document.querySelector('.start-button');

        // 2. 버튼에 클릭 이벤트를 연결합니다.
        startButton.addEventListener('click', () => {
            // 3. 현재 창의 위치를 'index.html'로 변경합니다.
            //    여기서는 자기 자신인 index.html로 이동하여 화면을 새로고침하는 효과를 냅니다.
            //    만약 다른 페이지(예: main.html)로 이동하고 싶다면, 주소를 변경하세요.
            window.location.href = 'index.html';
        });
    });
</script>