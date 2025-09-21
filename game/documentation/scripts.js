document.addEventListener("DOMContentLoaded", LateLoad);

function LateLoad() {
    
    Update();
}

function Update() {
    
    requestAnimationFrame(Update);
}
