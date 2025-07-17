// ตัวแปรสำหรับเวลา
let secondsElapsed = 0;
const timerElement = document.getElementById("timer");

// ฟังก์ชันอัปเดตเวลา
function updateTimer() {
  secondsElapsed++;
  const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
  const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
  timerElement.textContent = `${minutes}:${seconds}`;
}

// เริ่มจับเวลา
setInterval(updateTimer, 1000);

// หนอน
const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let segmentCount = 20;           // เริ่มต้นข้อต่อ 20
    const segmentLength = 12;
    const baseTentacleLength = 12;
    const fadeRange = 10;
    const segments = [];

    for (let i = 0; i < segmentCount; i++) {
      segments.push({ x: canvas.width / 2, y: canvas.height / 2 });
    }

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // สร้างลูกบอลแบบสุ่ม
    const balls = [];
    const numBalls = 5;

    function spawnBall() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 8 + Math.random() * 5 // ขนาดสุ่ม 8–13 px
      };
    }

    for (let i = 0; i < numBalls; i++) {
      balls.push(spawnBall());
    }

    function drawHeadTriangle(x, y, angle) {
      const size = 10;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      ctx.lineTo(x + Math.cos(angle + Math.PI * 0.75) * size * 0.6, y + Math.sin(angle + Math.PI * 0.75) * size * 0.6);
      ctx.lineTo(x + Math.cos(angle - Math.PI * 0.75) * size * 0.6, y + Math.sin(angle - Math.PI * 0.75) * size * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    function drawTentacle(x, y, angle, side, length) {
      const curve = 0.3;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const cx = x + Math.cos(angle + side * Math.PI / 2) * length * 0.5 + Math.cos(angle) * length * curve;
      const cy = y + Math.sin(angle + side * Math.PI / 2) * length * 0.5 + Math.sin(angle) * length * curve;
      const ex = x + Math.cos(angle + side * Math.PI / 2) * length;
      const ey = y + Math.sin(angle + side * Math.PI / 2) * length;
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.stroke();
    }

    function checkCollision(x, y, ball) {
      const dx = ball.x - x;
      const dy = ball.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < ball.r + 10;
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // เคลื่อนหัว
      segments[0].x += (mouse.x - segments[0].x) * 0.2;
      segments[0].y += (mouse.y - segments[0].y) * 0.2;

      for (let i = 1; i < segments.length; i++) {
        let dx = segments[i - 1].x - segments[i].x;
        let dy = segments[i - 1].y - segments[i].y;
        const angle = Math.atan2(dy, dx);
        segments[i].x = segments[i - 1].x - Math.cos(angle) * segmentLength;
        segments[i].y = segments[i - 1].y - Math.sin(angle) * segmentLength;
      }

      // วาดลำตัว
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(segments[0].x, segments[0].y);
      for (let i = 1; i < segments.length; i++) {
        ctx.lineTo(segments[i].x, segments[i].y);
      }
      ctx.stroke();

      // วาดระยาง
      for (let i = 3; i < segments.length; i++) {
        let dx = segments[i - 1].x - segments[i].x;
        let dy = segments[i - 1].y - segments[i].y;
        const angle = Math.atan2(dy, dx);

        let factor = 1;
        if (i >= segments.length - fadeRange) {
          factor = (segments.length - 1 - i) / fadeRange;
        } else if (i >= 3 && i <= 5) {
          factor = 0.5;
        }

        const length = baseTentacleLength * factor;
        drawTentacle(segments[i].x, segments[i].y, angle, 1, length);
        drawTentacle(segments[i].x, segments[i].y, angle, -1, length);
      }

      // วาดหัว
      const headAngle = Math.atan2(mouse.y - segments[0].y, mouse.x - segments[0].x);
      drawHeadTriangle(segments[0].x, segments[0].y, headAngle);

      // วาดลูกบอล
      for (let ball of balls) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        // ตรวจสอบการชน
        if (checkCollision(segments[0].x, segments[0].y, ball)) {
          // เพิ่มข้อต่อใหม่ 1 ข้อ (ต่อท้ายจากข้อสุดท้าย)
          const last = segments[segments.length - 5];
          segments.push({ x: last.x, y: last.y });
          // รีเซ็ตตำแหน่งลูกบอล
          ball.x = Math.random() * canvas.width;
          ball.y = Math.random() * canvas.height;
          ball.r = 8 + Math.random() * 5;
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

