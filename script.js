// creating an audio context
var context;

window.addEventListener('load', init, false);
function init(){
    try{
        context = new AudioContext();
    }
    catch(e){
        alert("Web Audio API is not supported int this browser")
    }
}

//Sound loading function
var soundBuffer = null;
var source = null;
var startTime = 0;
var pauseOffset = 0;
var isPlaying = false;

var gainNode = null;
var isMuted = false;

async function loadFromFile(){
    const fileInput = document.getElementById("audioFile");
    const filename = document.getElementById("trackName")
    if (!fileInput.files.length){
        alert("Select a file first");
        return;
    }

    try{
        await context.resume();
        gainNode = context.createGain();

        const file = fileInput.files[0];
        const arrayBuffer = await file.arrayBuffer();

        soundBuffer = await context.decodeAudioData(arrayBuffer);
        filename.textContent = file.name
    }catch(err){
        console.error(err)
    }
}

//Sound playing function

function playSound(){
    if (!soundBuffer) {
        alert("Load audio first")
        return;
    
    }
    if (isPlaying) return; //prevent double play

    source = context.createBufferSource(); // creation of sound source
    source.buffer = soundBuffer; // tell the source which sound to play
    source.connect(gainNode);
    gainNode.connect(context.destination); // connect the source to the context's destination (the speakers)
    source.start(0, pauseOffset);

    startTime = context.currentTime;
    isPlaying = true;

    source.onended = function(){ 
        if (isPlaying){
            pauseOffset = 0;
            isPlaying = false;
        }
    }
}

function pauseSound(){
    if (!isPlaying) return;

    source.stop();
    pauseOffset += context.currentTime - startTime;  
    isPlaying = false;
}

function muteSound(){
    if (!gainNode) return;

    isMuted = !isMuted;
    gainNode.gain.value = isMuted ? 0 : 1;

    document.querySelector(".controls button:nth-child(2)").textContent = isMuted ? "Unmute" : "Mute";
}

function skipForward(){
    if (!soundBuffer) return;

    const wasPlaying = isPlaying;
    if (isPlaying){
        source.stop();
        pauseOffset += context.currentTime - startTime;
        isPlaying = false;
    }

    pauseOffset = Math.min(pauseOffset + 5, soundBuffer.duration - 0.1); // skip ahead by 5 seconds
    if (wasPlaying) playSound();
}

function skipBackward(){
    if (!soundBuffer) return;

    const wasPlaying = isPlaying;
    if (isPlaying){
        source.stop();
        pauseOffset += context.currentTime - startTime;
        isPlaying = false;
    }

    pauseOffset = Math.max(pauseOffset - 5, 0); // skip behind by 5 seconds

    if (wasPlaying) playSound();
}