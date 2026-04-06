// HTML 문서가 브라우저에 의해 모두 읽혀지고 DOM 트리가 완성되면 실행됨 
document.addEventListener('DOMContentLoaded', function () {

  // --- 1. DOM 요소 선택 (Selection) --- 
  // HTML 태그들을 JS에서 조작하기 위해 메모리 객체 주소를 변수에 저장합니다. 
  const openModalBtn = document.getElementById('openModalBtn');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');
  const studentNameInput = document.getElementById('studentName');
  const daySelectInput = document.getElementById('daySelect');
  const startTimeInput = document.getElementById('startTimeSelect');
  const endTimeInput = document.getElementById('endTimeSelect');
  const miniCalendarDays = document.getElementById('miniCalendarDays');
  const miniCalendarTitle = document.getElementById('miniCalendarTitle');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const prevWeekBtn = document.getElementById('prevWeek');
  const nextWeekBtn = document.getElementById('nextWeek');
  const todayBtn = document.getElementById('todayBtn');
  const weekTitle = document.getElementById('weekTitle');
  const scheduleGrid = document.getElementById('scheduleGrid');
  // --- 2. 앱의 상태(State) 데이터 정의 --- 
  let currentDate = new Date(); // 현재 시간 객체 생성 
  // classes: 사용자가 입력한 수업 정보 객체들을 보관하는 핵심 배열입니다. (데이터 중심 설계) 
  let classes = [];
  // // colorClasses: 수업 블록에 입힐 CSS 클래스 이름들을 배열로 관리합니다.(순환 사용) 
  const colorClasses = ['color-yellow', 'color-blue', 'color-green', 'color-purple', 'color-red'];
  // 현재 달의 1일을 기준으로 표시할 달력 정보를 저장합니다. (미니 달력이 현재 어느 달을 보여주고 있는지 저장함) 
  let displayedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // 메인 시간표가 보여주는 주의 시작일(월요일) 정보입니다. (현재 날짜가 포함된 주의 월요일 날짜를 계산하여 저장함) 
  let selectedWeekStart = getWeekStart(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // --- 3. 핵심 로직 함수 (Logic Functions) --- 
  // 특정 날짜가 속한 주의 월요일을 반환하는 함수입니다. 
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0(일) ~ 6(토) 

    let diff;
    // 오늘이 일요일(0)이라면 6일을 빼서 지난 월요일로 이동함 
    if (day === 0) {
      diff = d.getDate() - 6;
    } else {
      // 그 외 요일이라면 (오늘 일자 - 요일 번호 + 1)을 하여 이번 주 월요일로 이동함 
      diff = d.getDate() - day + 1;
    }

    d.setDate(diff); // 계산된 일자로 날짜를 수정함 
    return d;
  }
  // 두 날짜의 연, 월, 일이 일치하는지 불리언(True/False)으로 반환하는 함수입니다. 
  function isSameDay(d1, d2) {
    const yearSame = d1.getFullYear() === d2.getFullYear();
    const monthSame = d1.getMonth() === d2.getMonth();
    const dateSame = d1.getDate() === d2.getDate();

    if (yearSame && monthSame && dateSame) {
      return true;
    } else {
      return false;
    }
  }
  // 선택된 1주일 범위 안에 특정 날짜가 포함되는지 검사하는 함수 
  // (시간표에 수업 블록을 그릴 때, 해당 날짜가 현재 선택된 주에 포함되는지 검사하는 데 사용됨) 
  function isInSelectedWeek(date) {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 월요일 시작점부터 6일 뒤(일요일)를 끝점으로 잡음 

    if (date >= selectedWeekStart && date <= weekEnd) {
      return true;
    } else {
      return false;
    }
  }
  // 미니 달력을 화면에 그려주는 함수 
  function renderMiniCalendar() {
    // 상단 제목 업데이트 (예: March 2026) 
    miniCalendarTitle.textContent = monthNames[displayedMonth.getMonth()] + " " +
      displayedMonth.getFullYear();

    // 기존에 그려진 날짜들을 모두 지움 
    miniCalendarDays.innerHTML = '';
    const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);

    // 달력의 첫 칸에 표시할 날짜 계산 (첫날이 속한 주의 일요일부터 시작)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    // 42칸(6주) 동안 반복하며 날짜 상자를 생성함 
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // <div> 태그를 새로 만듦 
      const dayEl = document.createElement('div');
      dayEl.className = 'mini-day';
      dayEl.textContent = date.getDate();
      // 다른 달의 날짜라면 흐리게 표시하기 위해 클래스 추가 
      if (date.getMonth() !== displayedMonth.getMonth()) {
        dayEl.classList.add('other-month');
      }
      // 오늘 날짜라면 강조하기 위해 클래스 추가 
      if (isSameDay(date, currentDate)) {
        dayEl.classList.add('today');
      }
      // 현재 선택된 주차에 포함된다면 배경색을 칠하기 위해 클래스 추가 
      if (isInSelectedWeek(date)) {
        dayEl.classList.add('in-week');
      }
      // 날짜 클릭 시 해당 주로 시간표를 이동시키는 이벤트를 등록합니다. 
      dayEl.addEventListener('click', function () {
        selectedWeekStart = getWeekStart(date); // 클릭한 날짜가 속한 주의 월요일을 찾음 
        renderMiniCalendar(); // 달력 다시 그리기 
        renderWeekView(); // 메인 시간표 다시 그리기 
      });
      // 완성된 날짜 상자를 달력 컨테이너에 넣음 
      miniCalendarDays.appendChild(dayEl);
    }
  }
  // 메인 주간 시간표와 등록된 수업 카드들을 화면에 그리는 함수입니다. 
  function renderWeekView() {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startMonth = monthNames[selectedWeekStart.getMonth()];
    const endMonth = monthNames[weekEnd.getMonth()];
    // 상단 주간 타이틀 업데이트 
    if (selectedWeekStart.getMonth() === weekEnd.getMonth()) {
      weekTitle.textContent = startMonth + " " + selectedWeekStart.getDate() + " - " + weekEnd.getDate()
        + ", " + selectedWeekStart.getFullYear();
    } else {
      weekTitle.textContent = startMonth + " " + selectedWeekStart.getDate() + " - " + endMonth + " " +
        weekEnd.getDate() + ", " + weekEnd.getFullYear();
    }
    // 기존 시간표 그리드 삭제 
    // scheduleGrid.innerHTML = ''; 

    // 시간표 맨 위 헤더 줄(요일과 날짜) 생성
    const timeHeader = document.createElement('div');
    timeHeader.className = 'grid-cell header';
    timeHeader.textContent = 'Time';
    scheduleGrid.appendChild(timeHeader);
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart);
      //각 열에 해당하는 날짜 계산 월욜부터 시간해서 7일간
      date.setDate(date.getDate() + i);
      //헤더 셀생성
      const headerCell = document.createElement('div');
      headerCell.className = 'grid-cell header';
      //오늘 날짜인경우 헤더셀에 특별한 클래스 추가해서 강조
      if (isSameDay(date, currentDate)) {
        headerCell.classList.add('today-col');
      }
      //요일 이름 인덱스 계싼 (월요일부터 시작하므로 +1보정)
      const dayNameIndex = (i + 1) % 7;
      //헤더셀에 요일과 날짜를함꼐 표시 (예:"Mon 23")
      headerCell.innerHTML = ` 
        <div style="text-align: center;"> 
          <div class="header-day">${dayNames[dayNameIndex]}</div> 
          <div class="header-date">${date.getDate()}</div> 
        </div> 
      `;
      scheduleGrid.appendChild(headerCell);
    }
    // 시간행 생성 (9시부터 21시까지) 
    for (let hour = 9; hour <= 21; hour++) {
      // 좌측 시간 표시 라벨 
      const timeLabel = document.createElement('div');
      timeLabel.className = 'grid-cell time-label';
      // 시간 숫자가 한 자리인 경우 앞에 0을 붙여서 "09:00" 형식으로 표시 
      let hourString = hour.toString();
      if (hour < 10) {
        hourString = "0" + hourString;
      }
      timeLabel.textContent = hourString + ":00";
      scheduleGrid.appendChild(timeLabel);
      // 각 시간별 7개 요일 칸 생성 
      for (let day = 0; day < 7; day++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.position = 'relative'; // 자식 요소 절대 위치 기준점 
        // 해당 셀의 날짜 계산 
        const cellDate = new Date(selectedWeekStart);
        // day 변수는 0(월) ~ 6(일)이므로, 셀의 날짜는 선택된 주의 시작일에 day만큼 더한 날짜가 됩니다.
        cellDate.setDate(cellDate.getDate() + day);
        const cellDateStr = cellDate.toISOString().split('T')[0];
        // "YYYY-MM-DD" 형식 
        // 해당 날짜와 시작 시간에 등록된 수업이 있는지 확인 
        const classForCell = classes.find(function (c) {
          return c.date === cellDateStr && c.startHour === hour;
        });
        if (classForCell) {
          //시작 분을 기반으로 top 위치 계싼 (0분 = 0%, 30분 = 50%)
        }
        const topOffset = (classForCell.startMinutes / 60) * 100;
        //수업시간 (분 단위)를 계산해서 높이결정 
        const startTotalMinutes = classForCell.startHour * 60 + classForCell.startMinutes;
        const endTotalMinutes = classForCell.endHour * 60 + classForCell.endMinutes;
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        //높이 셀 높이 (60분 =100% 기준으로 계산)
        const heighPercent = (durationMinutes / 60) * 100;
        //시간표시 문자열 생성
        const startTimeStr = classForCell.startHour.toString().padStart(2, '0') + ':' +
          classForCell.startMinutes.toString().padStart(2, '0');
        const endTimeStr = classForCell.endHour.toString().padStart(2, '0') + ':' +
          classForCell.endMinutes.toString().padStart(2, '0');
        classBlock.style.position = 'absolute';
        //topOffset과 heightPrecent 이용해서 수업 블록 위치와 크기 설정
        classBlock.style.top = topOffset + '%';
        classBlock.style.height = heightPercent + '%';
        classBlock.style.left = '2px';
        classBlock.style.right = '2px';
        classBlock.style.padding = '4px';
        classBlock.style.borderRadius = '4px';
        classBlock.style.fontSize = '11px';
        classBlock.style.zIndex = '1';
        classBlock.style.overflow = 'hidden';
        classBlock.style.boxSizing = 'border-box';
        cell.appendChild(classBlock);
      }
      scheduleGrid.appendChild(cell);
    }
  }
}
    // --- 4. 이벤트 리스너 등록 (Event Listeners) --- 
  // 이전 주 버튼 클릭 시 
  prevWeekBtn.addEventListener('click', function () {
  selectedWeekStart.setDate(selectedWeekStart.getDate() - 7);
  displayedMonth = new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), 1);
  renderMiniCalendar();
  renderWeekView();
});

// 다음 주 버튼 클릭 시 
// 오늘 버튼 클릭 시 
todayBtn.addEventListener('click', function () {
  currentDate = new Date();
  selectedWeekStart = getWeekStart(currentDate);
  displayedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  renderMiniCalendar();
  renderWeekView();
});
// 모달 열

// 모달 열기 버튼 클릭 시 
openModalBtn.addEventListener('click', function () {
  modal.classList.add('active'); // active 클래스를 추가하여 CSS가 display: flex를 적용하게 함 
});
// 모달 닫기 버튼(X) 클릭 시 
closeMOdalBtn.addEventListener('click', function ()) {
  modal.classLIst.remove('active');
});
// 모달 외부 배경 클릭 시 닫기 
modal.addEventListener('click', function (e) {
  // 클릭된 실제 대상(e.target)이 모달 배경(modal) 그 자체일 때만 닫음 
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});
// 키보드 ESC 키를 누르면 모달 닫기 
//여기부터 

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    // 모달이 현재 열려있는 상태인지 확인 
    if (modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  }
});
// 등록 버튼 클릭 시 새 수업 추가 
submitBtn.addEventListener('click', function () {
  const studentName = studentNameInput.value.trim();
  const day = daySelectInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  // 입력값 검증 
  if (!studentName) {
    alert('학생 이름을 입력하세요.');
    return;
  }
  if (!startTime) {
    alert('시작 시간을 선택하세요.');
    return;
  }
  if (!endTime) {
    alert('종료 시간을 선택하세요.');
    return;
  }
  if (startTime >= endTime) {
    alert('종료 시간은 시작 시간보다 늦어야 합니다.');
    return;
  }
  // 요일을 숫자로 변환 (mon=0, tue=1, ... sun=6) 
  const dayMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
  const dayIndex = dayMap[day];
  // 시작 시간에서 시(hour)와 분(minutes) 추출 
  const startParts = startTime.split(':');
  const startHour = parseInt(startParts[0]);
  const startMinutes = parseInt(startParts[1]);
  // 종료 시간에서 시(hour)와 분(minutes) 추출 
  const endParts = endTime.split(':');
  const endHour = parseInt(endParts[0]);
  const endMinutes = parseInt(endParts[1]);
  // 현재 선택된 주의 해당 요일 날짜 계산 
  const classDate = new Date(selectedWeekStart);
  classDate.setDate(classDate.getDate() + dayIndex);
  // 새 수업 객체 생성 및 배열에 추가 (특정 날짜 저장) 

  const newClass = {
    studentName: studentName,
    date: classDate.toISOString().split('T')[0], // "YYYY-MM-DD" 형식으로 저장 
    startHour: startHour,
    startMinutes: startMinutes,
    endHour: endHour,
    endMinutes: endMinutes,
    colorClass: colorClasses[classes.length % colorClasses.length]
  };
  classes.push(newClass);
  // 폼 초기화 및 모달 닫기 
  studentNameInput.value = '';
  startTimeInput.value = '';
  endTimeInput.value = '';
  modal.classList.remove('active');
  // 시간표 다시 그리기 
  renderWeekView();
});
// --- 5. 초기화 실행 (Initialization) --- 
renderMiniCalendar();
renderWeekView(); 
}); 
