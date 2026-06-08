 // 🚨 สิ่งที่ต้องทำ: เปลี่ยนลิงก์โมเดลจากหน้าโปรเจกต์ Teachable Machine ของคุณที่นี่ (ต้องปิดท้ายด้วย / เสมอ)
const URL = "./my_model/";

let model, labelContainer, maxPredictions;

// ฟังก์ชันหลัก: รับรูปภาพ แสดงตัวอย่าง และส่งให้ AI ทำนาย
async function previewAndPredict(event) {
    const input = event.target;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const preview = document.getElementById("image-preview");
    const placeholder = document.getElementById("upload-placeholder");
    const spinner = document.getElementById("loading-spinner");

    // 1. แสดงรูปภาพตัวอย่างบนหน้าเว็บ
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.classList.remove("hidden");
        placeholder.classList.add("hidden");
        document.getElementById("btn-clear").classList.remove("hidden");
    }
    reader.readAsDataURL(file);

    // 2. เปิดสถานะ Loading เพื่อเตรียมรัน AI
    spinner.classList.remove("hidden");

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // 3. โหลดโมเดล (จะโหลดเฉพาะครั้งแรกที่ใช้งาน)
        if (!model) {
            model = await tmImage.load(modelURL, metadataURL);
        }
        maxPredictions = model.getTotalClasses();

        // 4. รอให้ Element รูปภาพโหลดข้อมูลเสร็จสมบูรณ์ก่อนนำไปคำนวณ
        preview.onload = async function() {
            // สร้างโครงสร้างแถบเปอร์เซ็นต์ใน UI
            initLabelUI();
            
            // ส่ง Element รูปภาพให้ AI ทำนายคำตอบ
            const prediction = await model.predict(preview);
            
            // อัปเดตผลลัพธ์ขึ้นหน้าจอ
            for (let i = 0; i < maxPredictions; i++) {
                const className = prediction[i].className;
                const probability = prediction[i].probability;
                const percentage = Math.round(probability * 100);

                const item = labelContainer.childNodes[i];
                if (item && item.querySelector) {
                    item.querySelector(".class-name").innerText = className;
                    item.querySelector(".class-prob").innerText = percentage + "%";
                    item.querySelector(".class-bar").style.width = percentage + "%";
                }
            }
            // ปิดสถานะ Loading
            spinner.classList.add("hidden");
        };

    } catch (error) {
        alert("ผิดพลาด: ไม่สามารถโหลดโมเดลหรือประมวลผลรูปภาพได้ กรุณาตรวจสอบลิงก์ URL โมเดลของคุณ");
        clearImage();
    }
}

// ฟังก์ชันสร้างโครงสร้าง UI สำหรับแสดงแถบเปอร์เซ็นต์คำทำนาย
function initLabelUI() {
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.className = "space-y-1";
        itemDiv.innerHTML = `
            <div class="flex justify-between text-sm font-medium text-gray-700">
                <span class="class-name">...</span>
                <span class="class-prob font-mono text-blue-600">0%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="class-bar bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
        `;
        labelContainer.appendChild(itemDiv);
    }
}

// ฟังก์ชันล้างค่ารูปภาพเพื่ออัปโหลดใหม่
function clearImage() {
    document.getElementById("image-selector").value = "";
    document.getElementById("image-preview").src = "#";
    document.getElementById("image-preview").classList.add("hidden");
    document.getElementById("upload-placeholder").classList.remove("hidden");
    document.getElementById("btn-clear").classList.add("hidden");
    document.getElementById("loading-spinner").classList.add("hidden");
    document.getElementById("label-container").innerHTML = `<p class="text-gray-400 text-sm italic text-center py-12">อัปโหลดรูปภาพเพื่อเริ่มการทำนาย...</p>`;
}