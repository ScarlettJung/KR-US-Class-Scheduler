// server.js - Node.js Express 서버
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'schedules.json');


app.use(cors());
// JSON 요청 본문 파싱 미들웨어
app.use(express.json());

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(__dirname));

// --- GET /api/schedules ---
// 저장된 모든 수업 데이터를 반환합니다.
app.get('/api/schedules', function(req, res) {
    // 1. 비동기 방식으로 파일을 읽습니다. (서버의 멈춤 현상 방지)
    fs.readFile(DATA_FILE, 'utf8', function(err, data) {
        if (err) {
            // 2. 파일이 아예 없는 경우(ENOENT)에는 에러가 아니라 빈 데이터를 보냅니다.
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            // 3. 그 외의 심각한 시스템 오류 시 500 상태 코드를 보냅니다.
            console.error('파일 읽기 오류:', err);
            return res.status(500).json({ error: '서버 오류' });
        }

        try {
            // 4. 읽어온 텍스트 데이터를 자바스크립트 객체로 변환합니다.
            const schedules = JSON.parse(data);
            res.json(schedules);
        } catch (parseErr) {
            // 5. 파일 내용이 깨져있어 해석이 불가능할 경우 빈 배열을 반환합니다.
            console.error('JSON 파싱 오류:', parseErr);
            res.json([]);
        }
    });
});

// --- POST /api/schedules ---
// 새로운 수업 데이터를 저장합니다.
app.post('/api/schedules', function(req, res) {
    const newSchedule = req.body;

    // 1. 기존 데이터를 먼저 읽어옵니다.
    fs.readFile(DATA_FILE, 'utf8', function(err, data) {
        let schedules = [];
        // 에러가 없다면 기존 데이터를 객체 배열로 변환합니다.
        if (!err) {
            try {
                schedules = JSON.parse(data);
            } catch (parseErr) {
                schedules = [];
            }
        }

        // 2. 데이터 가공: 고유 ID와 시각적 스타일을 서버에서 결정합니다.
        const colorClasses = ['color-yellow', 'color-blue', 'color-green', 'color-purple', 'color-red'];
        newSchedule.id = Date.now(); // 타임스탬프 기반 고유 ID 생성
        newSchedule.colorClass = colorClasses[schedules.length % colorClasses.length];

        // 3. 배열에 새 데이터를 추가합니다.
        schedules.push(newSchedule);

        // 4. 비동기 방식으로 파일에 최종 저장합니다.
        fs.writeFile(DATA_FILE, JSON.stringify(schedules, null, 2), function(writeErr) {
            if (writeErr) {
                console.error('파일 쓰기 오류:', writeErr);
                return res.status(500).json({ error: '저장 실패' });
            }
            // 5. 성공 시 201(Created) 상태 코드와 생성된 데이터를 반환합니다.
            res.status(201).json(newSchedule);
        });
    });
});

// --- PUT /api/schedules/:id ---
// 기존 수업 데이터를 수정합니다.
app.put('/api/schedules/:id', function(req, res) {
    const scheduleId = parseInt(req.params.id); // URL에서 ID 추출
    const updatedData = req.body; // 수정할 데이터

    // 1. 기존 데이터를 읽어옵니다.
    fs.readFile(DATA_FILE, 'utf8', function(err, data) {
        if (err) {
            console.error('파일 읽기 오류:', err);
            return res.status(500).json({ error: '서버 오류' });
        }

        let schedules = [];
        try {
            schedules = JSON.parse(data);
        } catch (parseErr) {
            return res.status(500).json({ error: '데이터 파싱 오류' });
        }

        // 2. 해당 ID를 가진 수업을 찾습니다.
        const index = schedules.findIndex(function(schedule) {
            return schedule.id === scheduleId;
        });

        // 3. 찾지 못한 경우 404 에러를 반환합니다.
        if (index === -1) {
            return res.status(404).json({ error: '해당 수업을 찾을 수 없습니다.' });
        }

        // 4. 기존 데이터를 유지하면서 새 데이터로 업데이트합니다.
        // ID와 colorClass는 기존 값을 유지합니다.
        schedules[index] = {
            ...schedules[index],  // 기존 데이터 복사
            ...updatedData,       // 새 데이터로 덮어쓰기
            id: scheduleId,       // ID는 변경 불가
            colorClass: schedules[index].colorClass  // 색상도 유지
        };

        // 5. 파일에 저장합니다.
        fs.writeFile(DATA_FILE, JSON.stringify(schedules, null, 2), function(writeErr) {
            if (writeErr) {
                console.error('파일 쓰기 오류:', writeErr);
                return res.status(500).json({ error: '저장 실패' });
            }
            // 6. 성공 시 200(OK) 상태 코드와 수정된 데이터를 반환합니다.
            res.status(200).json(schedules[index]);
        });
    });
});

// --- DELETE /api/schedules/:id ---
// 수업 데이터를 삭제합니다.
app.delete('/api/schedules/:id', function(req, res) {
    const scheduleId = parseInt(req.params.id); // URL에서 ID 추출

    // 1. 기존 데이터를 읽어옵니다.
    fs.readFile(DATA_FILE, 'utf8', function(err, data) {
        if (err) {
            console.error('파일 읽기 오류:', err);
            return res.status(500).json({ error: '서버 오류' });
        }

        let schedules = [];
        try {
            schedules = JSON.parse(data);
        } catch (parseErr) {
            return res.status(500).json({ error: '데이터 파싱 오류' });
        }

        // 2. 해당 ID를 가진 수업을 찾습니다.
        const index = schedules.findIndex(function(schedule) {
            return schedule.id === scheduleId;
        });

        // 3. 찾지 못한 경우 404 에러를 반환합니다.
        if (index === -1) {
            return res.status(404).json({ error: '해당 수업을 찾을 수 없습니다.' });
        }

        // 4. 배열에서 해당 수업을 제거합니다.
        const deletedSchedule = schedules.splice(index, 1)[0];

        // 5. 파일에 저장합니다.
        fs.writeFile(DATA_FILE, JSON.stringify(schedules, null, 2), function(writeErr) {
            if (writeErr) {
                console.error('파일 쓰기 오류:', writeErr);
                return res.status(500).json({ error: '저장 실패' });
            }
            // 6. 성공 시 200(OK) 상태 코드와 삭제된 데이터를 반환합니다.
            res.status(200).json({
                message: '삭제 완료',
                deleted: deletedSchedule
            });
        });
    });
});

// 서버 시작
app.listen(PORT, function() {
    console.log('서버가 http://localhost:' + PORT + ' 에서 실행 중입니다.');
    console.log('브라우저에서 http://localhost:' + PORT + ' 을 열어주세요.');
});