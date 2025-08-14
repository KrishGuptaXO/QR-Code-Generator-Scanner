// Nav
const generatorTab = document.querySelector(".nav-gen");
const scannerTab = document.querySelector(".nav-scan");
generatorTab.addEventListener("click",()=>{
    generatorTab.classList.add("active");
    scannerTab.classList.remove("active");
    document.querySelector(".scanner").style.display="none";
    document.querySelector(".generator").style.display="block";
});
scannerTab.addEventListener("click",()=>{
    scannerTab.classList.add("active");
    generatorTab.classList.remove("active");
    document.querySelector(".scanner").style.display="block";
    document.querySelector(".generator").style.display="none";
});

// Generator
const generatorDiv = document.querySelector(".generator");
const generatorBtn = generatorDiv.querySelector(".generator-form button");
const qrInput = generatorDiv.querySelector(".generator-form input");
const qrImg = generatorDiv.querySelector(".generator-image img");
const downloadBtn = generatorDiv.querySelector(".generator-btn .btn-link");
let imgURL = '';
generatorBtn.addEventListener("click",()=>{
    let qrValue = qrInput.value;
    if(!qrValue.trim()) return;
    generatorBtn.innerText = "Generating QR Code...";
    imgURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`;
    qrImg.src = imgURL;
    qrImg.addEventListener("load",()=>{
        generatorDiv.classList.add("active");
        generatorBtn.innerText = "Generate QR Code";
    });
});
// Download button
downloadBtn.addEventListener("click",()=>{
    if(!imgURL) return;
    fetchImage(imgURL);
});
function fetchImage(url){
    fetch(url).then(res => res.blob()).then(file=>{
        let tempFile = URL.createObjectURL(file);
        let file_name = url.split("/").pop().split(".")[0];
        let extension = file.type.split("/")[1];
        download(tempFile,file_name,extension);
    })
    .catch(()=>imgURL = '');
}
function download(tempFile,file_name,extension){
    let a = document.createElement('a');
    a.href = tempFile;
    a.download = `${file_name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

qrInput.addEventListener("input",()=>{
    if(!qrInput.value.trim()){
        return generatorDiv.classList.remove("active");
    }
})

//Scanner
const ScannerDiv = document.querySelector(".scanner");
const camera = ScannerDiv.querySelector("h1 .fa-camera");
const StopCam = ScannerDiv.querySelector("h1 .fa-circle-stop");
const form = ScannerDiv.querySelector(".scanner-form");
const fileInput = form.querySelector("input");
const p = form.querySelector("p");
const img = form.querySelector("img");
const video = form.querySelector("video");
const content = form.querySelector(".content");
const textarea = ScannerDiv.querySelector(".scanner-details textarea");
const copyBtn = ScannerDiv.querySelector(".scanner-details .copy");
const closeBtn = ScannerDiv.querySelector(".scanner-details .close");
// Input file
form.addEventListener("click",()=>fileInput.click());
// Scan QR Img
fileInput.addEventListener("change",e=>{
    let file = e.target.files[0];
    if(!file) return;
    fetchRequest(file);
});
function fetchRequest(file){
    let formData = new FormData();
    formData.append("file",file);
    p.innerText = "Scanning QR Code...";
    fetch(`http://api.qrserver.com/v1/read-qr-code/`,{
        method: "POST",body: formData
    }).then(res => res.json()).then(result => {
        let text = result[0].symbol[0].data;
        if(!text){
            return p.innerText = "Couldn't Scan QR Code ";
        }
        ScannerDiv.classList.add("active");
        form.classList.add("active-img");
        img.src = URL.createObjectURL(file);
        textarea.innerText=text;
    });
}
//Camera
let scanner;
camera.addEventListener("click",()=>{
    camera.style.display = "none";
    form.classList.add("pointerEvents");
    p.innerText = "Scanning QR Code...";
    scanner = new Instascan.Scanner({video: video});
    Instascan.Camera.getCameras()
        .then(cameras =>{
            if(cameras.length>0){
                scanner.start(cameras[0]).then(()=>{
                    form.classList.add("active-video");
                    StopCam.style.display = "inline-block";
                })
            } else{
                console.log("No Camera Found");
            }
        })
        .catch(err=> console.error(err));
    scanner.addListener("scan",c=>{
        ScannerDiv.classList.add("active");
        textarea.innerText = c;
    })
})
// Copy
copyBtn.addEventListener("click",()=>{
    let text = textarea.textContent;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
});
//Close
function stopScan(){
    p.innerText = "Upload QR Code to Scan";
    camera.style.display="block";
    StopCam.style.display="none";
    form.classList.remove("active-video","active-img","pointerEvents");
    ScannerDiv.classList.remove("active");
    if(scanner) scanner.stop();
}
closeBtn.addEventListener("click",()=>stopScan());
StopCam.addEventListener("click",()=>stopScan());