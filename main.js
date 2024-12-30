function build() {
    const game = document.querySelector("#game");
    // 기존 DOM 요소 삭제
    elements.forEach((element) => element.remove());
    elements = []; // 요소 배열 초기화

    // 새 DOM 요소 생성 및 추가
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            const element = document.createElement("div");
            element.className = "element";
            element.setAttribute("draggable", true);
            element.setAttribute("id", `${i},${j}`);
            element.style.width = `${w}px`;
            element.style.height = `${w}px`;

            element.style.backgroundImage = `url(images/${data[i][j]}.png)`;
            element.style.position = "absolute"; // Ensure absolute positioning
            element.style.top = `${i * w}px`;
            element.style.left = `${j * w}px`;

            // 드래그 이벤트 핸들러 추가
            element.addEventListener("dragstart", (e) => {
                e.dataTransfer.setDragImage(new Image(), 0, 0);
                startX = e.clientX;
                startY = e.clientY;
                element.style.zIndex = "1024";
            });

            element.addEventListener("drag", (e) => {
                if (e.clientX === 0 && e.clientY === 0) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    currentX = Math.max(-w, Math.min(w, deltaX));
                    currentY = 0;
                } else {
                    currentY = Math.max(-w, Math.min(w, deltaY));
                    currentX = 0;
                }

                element.style.transform = `translate(${currentX}px, ${currentY}px)`;
            });

            element.addEventListener("dragend", (e) => {
                if (
                    Math.abs(currentX) >= w * 0.7 ||
                    Math.abs(currentY) >= w * 0.7
                ) {
                    const direction =
                        Math.abs(currentX) > Math.abs(currentY)
                            ? currentX > 0
                                ? "right"
                                : "left"
                            : currentY > 0
                            ? "down"
                            : "up";

                    console.log("Moved:", direction);
                    whenMove(element.id.split(",").map(Number), direction);

                    const computedStyle = window.getComputedStyle(element);
                    const currentLeft = parseInt(computedStyle.left, 10) || 0;
                    const currentTop = parseInt(computedStyle.top, 10) || 0;

                    element.style.left = `${currentLeft + currentX}px`;
                    element.style.top = `${currentTop + currentY}px`;
                    element.style.transform = "";
                } else {
                    element.style.transform = "";
                }

                element.style.zIndex = "1";
                startX = 0;
                startY = 0;
                currentX = 0;
                currentY = 0;
            });

            game.appendChild(element);
            elements.push(element); // 새 요소 추가
        }
    }
}

// 게임 상태를 확인하는 함수
function whenMove(coord, direction) {
    const temp = structuredClone(data);
    const r = coord[0];
    const c = coord[1];

    if (direction === "up") {
        temp[r][c] = data[r - 1][c];
        temp[r - 1][c] = data[r][c];
    } else if (direction === "down") {
        temp[r][c] = data[r + 1][c];
        temp[r + 1][c] = data[r][c];
    } else if (direction === "left") {
        temp[r][c] = data[r][c - 1];
        temp[r][c - 1] = data[r][c];
    } else if (direction === "right") {
        temp[r][c] = data[r][c + 1];
        temp[r][c + 1] = data[r][c];
    }

    const check = checkMatches(temp);
    if (check) {
        limit -= 1;
        limitChange();
    } else {
        build();
    }
}

function checkMatches(temp) {
    const rows = temp.length; // 행 개수
    const cols = temp[0].length; // 열 개수

    // 가로 매칭 확인
    for (let i = 0; i < rows; i++) {
        let count = 1; // 연속된 숫자 개수
        for (let j = 1; j < cols; j++) {
            if (temp[i][j] === temp[i][j - 1]) {
                count++;
                if (
                    count >= 3 &&
                    (j === cols - 1 || temp[i][j] !== temp[i][j + 1])
                ) {
                    animation(
                        {
                            type: "horizontal",
                            row: i,
                            startCol: j - count + 1,
                            endCol: j,
                            length: count,
                        },
                        temp
                    );
                    return true;
                }
            } else {
                count = 1;
            }
        }
    }

    // 세로 매칭 확인
    for (let j = 0; j < cols; j++) {
        let count = 1; // 연속된 숫자 개수
        for (let i = 1; i < rows; i++) {
            if (temp[i][j] === temp[i - 1][j]) {
                count++;
                if (
                    count >= 3 &&
                    (i === rows - 1 || temp[i][j] !== temp[i + 1][j])
                ) {
                    animation(
                        {
                            type: "vertical",
                            col: j,
                            startRow: i - count + 1,
                            endRow: i,
                            length: count,
                        },
                        temp
                    );
                    return true;
                }
            } else {
                count = 1;
            }
        }
    }

    return;
}

function animation(check, temp) {
    data = temp;
    console.log(data);
    build();

    let moved;
    console.log(check);
    score -= check.length;
    scoreChange();
    if (check.type === "vertical") {
        popup(data[check.startRow][check.col], check.length);

        // 삭제
        setTimeout(() => {
            for (let i = check.startRow; i <= check.endRow; i++) {
                document.getElementById(`${i},${check.col}`).remove();

                // data[i][check.col] = 0;
            }
        }, 0);

        // 내리기
        setTimeout(() => {
            for (let i = 0; i < check.startRow; i++) {
                moved = document.getElementById(`${i},${check.col}`);
                moved.style.top = `${(i + check.length) * w}px`;

                data[i + check.length][check.col] = data[i][check.col];
            }
        }, 100);

        // 추가하기
        setTimeout(() => {
            for (let i = 0; i < check.length; i++) {
                data[i][check.col] = Math.floor(Math.random() * 5) + 1;
            }

            if (check.length == 4) {
                data[check.startRow + 2][check.col] = 6;
            } else if (check.length == 5) {
                data[Math.floor((check.startRow + check.endRow) / 2)][
                    check.col
                ] = 7;
            }

            console.log(data);
            build();
            checkMatches(data);
        }, 600);
    } else if (check.type === "horizontal") {
        popup(data[check.row][check.startCol], check.length);

        // 삭제
        setTimeout(() => {
            for (let i = check.startCol; i <= check.endCol; i++) {
                document.getElementById(`${check.row},${i}`).remove();
            }
        }, 0);

        // 내리기
        setTimeout(() => {
            for (let i = check.row - 1; i >= 0; i--) {
                for (let j = check.startCol; j <= check.endCol; j++) {
                    moved = document.getElementById(`${i},${j}`);
                    moved.style.top = `${(i + 1) * w}px`;

                    data[i + 1][j] = data[i][j];
                }
            }
        }, 100);

        // 추가하기
        setTimeout(() => {
            for (let i = check.startCol; i <= check.endCol; i++) {
                data[0][i] = Math.floor(Math.random() * 5) + 1;
            }

            if (check.length == 4) {
                data[check.row][check.startCol + 2] = 6;
            } else if (check.length == 5) {
                data[check.row][
                    Math.floor((check.startCol + check.endCol) / 2)
                ] = 7;
            }

            console.log(data);
            build();
            checkMatches(data);
        }, 600);
    }
}

function scoreChange() {
    if (score <= 0) {
        document.getElementById("limit").innerText = "Complete";
        document.getElementById("score").remove();
    }

    document.getElementById("score").value = score;
}

function limitChange() {
    if (limit == 0) {
        document.getElementById("limit").innerText = "Game Over";
        return;
    }

    document.getElementById("limit").innerText = `Left: ${limit}`;
}

function popup(type, message) {
    let card = document.createElement("div");
    card.className = "popup";

    let img = document.createElement("img");
    img.src = `images/${type}.png`;
    img.onerror = () => {
        img.src = "images/default.png";
    };

    let txt = document.createElement("p");
    txt.innerText = message;

    card.appendChild(img);
    card.appendChild(txt);

    document.body.appendChild(card);

    setTimeout(() => {
        card.remove();
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    build(); // 초기 게임판 생성
    limitChange();
    checkMatches(data);

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
});

// Essential Data
let score = 20;
const length = 500;
const width = 6;
const w = length / width;
let elements = []; // DOM 요소 저장
// 2D 배열 생성
let data = Array.from({ length: width }, () =>
    Array.from({ length: width }, () => Math.floor(Math.random() * 5) + 1)
);
let limit = 10;