(function () {
    "use strict";

    function init() {

        var button = document.getElementById("button");
        var display = document.getElementById("display");
        var quit = false;
        var firstResponse = true;

        // Get HTML elements.
        var sceneElements = Array.from(document.getElementById("scene").children);

        // Filter unwanted elements; convert remaining elements into usable format.
        var sceneObjects = sceneElements.filter(
            element => element.tagName != "CANVAS" && element.tagName != "DIV" && element.tagName != "A-ENTITY"
        ).map(function (element) {
            element = element.tagName.slice(2).toLowerCase();

            if (element === "plane") {
                element = "ground";
            }

            if (element === "box") {
                element = "cube";
            }

            return element;
        });

        // Define prompts.
        const WelcomePrompt = "Hello. Do you want me to tell you about this WebXR scene? ";
        const Prompt = "What else do you want to know? ";
        const RePrompt = "Ask for help if you're not sure. ";
        const GoodbyePrompt = "OK. Goodbye! ";
        const ErrorPrompt = "I'm sorry, I didn't understand that. Please say it again. ";
        const HelpPrompt = "You can ask me to describe the scene, ask me how many things there are or what colour something is, or tell me to stop when you've had enough. What do you want me to tell you? ";

        // Check for SpeechRecognition support.
        if (!("webkitSpeechRecognition" in window)) {
            alert("This browser does not support the Web Speech API SpeechRecognition interface.");
        }
        else {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = "en";
            recognition.maxAlternatives = 1;
        }

        // Check for SpeechSynthesis support.
        if (window.SpeechSynthesisUtterance === undefined) {
            alert("This browser does not support the Web Speech API SpeechSynthesis interface.");
        }
        else {
            var utterance = new SpeechSynthesisUtterance();
        }

        recognition.onstart = function () {
            display.innerText = "Recognition started";
        };

        recognition.onend = function () {
            display.innerText = "Recognition stopped.";

            if (!quit) {
                recognition.start();
            }
        };

        recognition.onresult = function (event) {

            if (typeof (event.results) === "undefined") {
                recognition.stop();
                return;
            }

            for (let i = event.resultIndex; i < event.results.length; ++i) {

                if (event.results[i].isFinal) {
                    let transcript = event.results[i][0].transcript;
                    let transcriptBits = transcript.split(" ");
                    display.innerText = transcript + " Word: " + transcriptBits[1];

                    if (transcriptBits.includes("yes") || transcriptBits.includes("describe") || transcriptBits.includes("tell me about")) {
                        describeScene();
                    }
                    else if (transcriptBits.includes("how many")) {
                        let objType;

                        for (i = 0; i < transcriptBits.length; i++) {
                            objType = transcriptBits[i];

                            if (objType === "things" || objType === "objects" || objType === "spheres" || objType === "cubes") {
                                countObjects(objType);
                            }
                        }

                    }
                    else if (transcriptBits.includes("colour") || transcriptBits.includes("color")) {
                        let objColour;

                        for (i = 0; i < transcriptBits.length; i++) {
                            objType = transcriptBits[i];

                            if (objType === "balls" || objType === "ball" || objType === "spheres" || objType === "sphere" || objType === "cubes" || objType === "cube" || objType === "boxes" || objType === "box") {
                                objectColour(objType);
                            }

                        }
                    }
                    else if (transcriptBits.includes("help")) {
                        utterance.text = HelpPrompt;
                        window.speechSynthesis.speak(utterance);
                    }
                    else if (transcriptBits.includes("no")) {
                        if (firstResponse) {
                            firstResponse = false;
                            utterance.text = "OK. " + Prompt + RePrompt;
                        }
                        else {
                            utterance.text = "OK. " + Prompt;
                        }
                        window.speechSynthesis.speak(utterance);
                    }
                    else if (transcriptBits.includes("quit") || transcriptBits.includes("stop") || transcriptBits.includes("cancel") || transcriptBits.includes("nothing")) {
                        quit = true;
                        recognition.stop();

                        utterance.text = GoodbyePrompt;
                        window.speechSynthesis.speak(utterance);
                    }
                    else {
                        utterance.text = ErrorPrompt;
                        window.speechSynthesis.speak(utterance);

                    }
                }
                else {
                    display.innerText = "interim results: " + event.results[i][0].transcript;
                }
            }
        }

        function describeScene() {
            let response = "The scene contains ";

            for (let i = 0; i < sceneObjects.length - 1; i++) {
                let objType = sceneObjects[i];

                if (objType !== "sky" && objType !== "ground") {
                    response += "a " + sceneObjects[i] + ", ";
                }
                else {
                    response += "the " + sceneObjects[i] + ", ";
                }
            }

            response += "and " + sceneObjects[sceneObjects.length - 1] + ". ";

            if (firstResponse) {
                firstResponse = false;
                response += Prompt + RePrompt;
            }
            else {
                response += Prompt;
            }

            utterance.text = response;
            window.speechSynthesis.speak(utterance);
        }

        function countObjects(objType) {
            utterance.text = "You asked how many " + objType + " there are.";
            window.speechSynthesis.speak(utterance);
        }

        function objectColour(objType) {
            utterance.text = "You asked what colour the " + objType + " is.";
            window.speechSynthesis.speak(utterance);
        }

        button.addEventListener("click", () => {
            utterance.text = WelcomePrompt;
            window.speechSynthesis.speak(utterance);
            recognition.start();
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        init();
    });

})();