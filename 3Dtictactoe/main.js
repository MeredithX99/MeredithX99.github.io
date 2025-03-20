'use strict';

// Global variables for camera, scene, and renderer, used for 3D and CSS rendering respectively
var camera, scene, renderer;
var scene2, renderer2;

// Variables for camera control: an instance of the OrbitControls class from Three.js, used to add mouse or touch controls to rotate, zoom, and pan the camera. Provides user interactivity.
var controls;

// Global variable for text: an HTML element container used to wrap the Three.js scene and renderer.
var container;

// Global variables for the game board
var boardModel;

var squareSize = 10;

// Game board, size of a 3x3 grid
var boardSize = 3;

// Load image textures
var emptyTexture = new THREE.TextureLoader().load('image/empty.jpg');
var xTexture = new THREE.TextureLoader().load('image/x.jpg');
var oTexture = new THREE.TextureLoader().load('image/o.jpg');

// Object to store win counts for both players
var winCounts = {
    user1: 0,
    user2: 0
};

// Add game state and current player to global variables
var gameActive = true; // Indicates whether the game is still active
var gameEnded = false; // Add a flag to indicate whether the game is over or not.

var currentPlayer = 'user1'; // Current player, initially user 1

// Object to store game over message
var gameOverTextMesh;

// Global variables for score display
var scoreTextMesh;

// Function to initialize the scene
init();

// Function to start the animation loop
animate();

// Function to initialize the TicTacToe game
initGame();


function init() {
    // Define frustum size and aspect ratio for the orthographic camera
    var frustumSize = 500;
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);

    // Create a container for the 3D scene
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create an information display area
    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '';
    container.appendChild(info);

    // Create a perspective camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    //camera.position.set(500, 800, 1300);
    camera.lookAt(new THREE.Vector3());

    // Set camera position (viewer's perspective x,y,z)
    camera.position.set(0, 50, 250);

    // Create OrbitControls for camera manipulation
    controls = new THREE.OrbitControls(camera);

    // Create the main 3D scene with a white background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f1f1);


    // Create a separate scene for CSS3D rendering
    scene2 = new THREE.Scene();

    // Define basic material for 3D objects
    var material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: 1, side: THREE.DoubleSide });

    // Create planes with different colors and orientations
    createPlane(
        600, 600, '#e6fff7',
        new THREE.Vector3(-300, 50, 0),
        new THREE.Euler(0, -90 * THREE.Math.DEG2RAD, 0)
    ); // Left

    createPlane(
        600, 600, '#ffe6ff',
        new THREE.Vector3(0, 50, 300),
        new THREE.Euler(0, 0, 0)
    ); // Right

    createPlane(
        600, 600, '#ccccff',
        new THREE.Vector3(0, 50, -300),
        new THREE.Euler(0, 0, 0)
    ); // Left-back

    createPlane(
        600, 600, '#b3d9ff',
        new THREE.Vector3(300, 50, 0),
        new THREE.Euler(0, -90 * THREE.Math.DEG2RAD, 0)
    ); // Right-back

    createPlane(
        600, 600, '#000080',
        new THREE.Vector3(0, 350, 0),
        new THREE.Euler(-90 * THREE.Math.DEG2RAD, 0, 0)
    ); // Top

    createPlane(
        600, 600, '#00004d',
        new THREE.Vector3(0, -250, 0),
        new THREE.Euler(-90 * THREE.Math.DEG2RAD, 0, 0)
    ); // Bottom

    // Add 3D text to the left plane
    addTextToPlane2("Rules", new THREE.Vector3(-300, 220, 0), new THREE.Euler(0, 90 * THREE.Math.DEG2RAD, 0));
    addTextToPlane4("1. You and the computer take turns placing X and O markers. \n\n2. The first player to make a straight line horizontally, vertically, \n    diagonally, or in a cube WINS. \n\n3. You go first and place the X markers. \n\nHope you have fun!", new THREE.Vector3(-350, 160, 220), new THREE.Euler(0, 90 * THREE.Math.DEG2RAD, 0));

    // Add text to the left-back plane
    addTextToPlane("3 D", new THREE.Vector3(-50, 160, -300), new THREE.Euler(0, 0, 0));
    addTextToPlane("Tic Tac Toe", new THREE.Vector3(-150, 80, -300), new THREE.Euler(0, 0, 0));

    // Create columns
    createColumns();


    // Create WebGL renderer and append it to the document body
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create CSS3D renderer and append it to the document body
    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize(window.innerWidth, window.innerHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    document.body.appendChild(renderer2.domElement);

    // Function to create planes in both 3D and CSS3D scenes
    function createPlane(width, height, cssColor, pos, rot) {
        var element = document.createElement('div');
        element.style.width = width + 'px';
        element.style.height = height + 'px';
        element.style.opacity = 0.5; // Box opacity (lower values increase saturation of other colors)
        element.style.background = cssColor;

        var object = new THREE.CSS3DObject(element);
        object.position.copy(pos);
        object.rotation.copy(rot);
        scene2.add(object);

        var geometry = new THREE.PlaneBufferGeometry(width, height, -1, -1); // Set lower segment numbers
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(object.position);
        mesh.rotation.copy(object.rotation);
        scene.add(mesh);
    }

    // Add 3D text to the scene for score display
    addScoreTextToScene();

}


// Function to handle animation loop
function animate() {
    requestAnimationFrame(animate);

    // Render 3D and CSS3D scenes
    renderer.render(scene, camera);
    renderer2.render(scene2, camera);
}

// Function to create columns
function createColumns() {
    // Define column size and color
    var columnSize = 5; // Size of columns
    var columnColor = 0x1a1aff; // Color of columns, using blue here

    // Create 4 vertical columns and add them to the scene
    for (var i = 0; i < 4; i++) {
        // Create cube geometry
        var columnGeometry = new THREE.BoxGeometry(columnSize, 110, columnSize);

        // Create material
        var columnMaterial = new THREE.MeshBasicMaterial({ color: columnColor });

        // Create cube mesh
        var columnMesh = new THREE.Mesh(columnGeometry, columnMaterial);

        // Set cube position
        var xPosition = (i % 2 === 0) ? -27 : 27; // Place columns alternately
        var zPosition = (i < 2) ? -27 : 27; // Place columns alternately
        columnMesh.position.set(xPosition, 0, zPosition);

        // Add cube mesh to the scene
        scene.add(columnMesh);
    }

    // Create 3 layers of horizontally placed columns and add them to the scene
    for (var k = 0; k < 6; k++) {
        // Create cube geometry
        var horizontalColumnGeometry = new THREE.BoxGeometry(160, columnSize, columnSize);

        // Create material
        var horizontalColumnMaterial = new THREE.MeshBasicMaterial({ color: columnColor });

        // Create cube mesh
        var horizontalColumnMesh = new THREE.Mesh(horizontalColumnGeometry, horizontalColumnMaterial);

        // Set cube position (place columns alternately)
        var yPosition;
        if (k % 3 === 0) {
            yPosition = 0;
        } else if (k % 3 === 1) {
            yPosition = 56;
        } else {
            yPosition = -56;
        }
        var zPosition = (k < 3) ? -27 : 27;
        horizontalColumnMesh.position.set(0, yPosition, zPosition);
        // Add cube mesh to the scene
        scene.add(horizontalColumnMesh);
    }

    // Create 3 layers of vertically placed columns and add them to the scene
    for (var j = 0; j < 6; j++) {
        // Create cube geometry
        var horizontalColumnGeometry = new THREE.BoxGeometry(columnSize, columnSize, 160);

        // Create material
        var horizontalColumnMaterial = new THREE.MeshBasicMaterial({ color: columnColor });

        // Create cube mesh
        var horizontalColumnMesh = new THREE.Mesh(horizontalColumnGeometry, horizontalColumnMaterial);

        // Set cube position (place columns alternately)
        var yPosition;
        if (j % 3 === 0) {
            yPosition = 0;
        } else if (j % 3 === 1) {
            yPosition = 56;
        } else {
            yPosition = -56;
        }
        var xPosition = (j < 3) ? -27 : 27;
        horizontalColumnMesh.position.set(xPosition, yPosition, 0);
        // Add cube mesh to the scene
        scene.add(horizontalColumnMesh);
    }

}


// Function to add 3D text to a plane (Title)
function addTextToPlane(text, position, rotation) {
    // Create font loader
    var loader = new THREE.FontLoader();
    // Load bold font file
    loader.load('fonts/helvetiker_bold.typeface.json', function (font) {
        // Create text geometry
        var geometry = new THREE.TextGeometry(text, {
            font: font, // Specify font
            size: 48, // Set text size
            height: 10, // Set text thickness
            curveSegments: 2 // Curve segments, affecting the smoothness of text curve
        });

        // Compute bounding box of text geometry
        geometry.computeBoundingBox();
        var centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        // Define two materials for the text, for front and back faces
        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        // Create mesh object for the text using defined materials
        var mesh = new THREE.Mesh(geometry, materials);
        // Set position of the text
        mesh.position.copy(position).add(new THREE.Vector3(0, 0, 0));
        // Set rotation of the text
        mesh.rotation.copy(rotation);
        mesh.material[0].color = new THREE.Color(0x8000ff); // Set color for the first material
        mesh.material[1].color = new THREE.Color(0x330066); // Set color for the second material
        // Add the text mesh object to the scene
        scene.add(mesh);
    });
}

// Function to add 3D text to a plane (Tag)
function addTextToPlane2(text, position, rotation) {
    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry(text, {
            font: font,
            size: 36,
            height: 10,
            curveSegments: 2
        });

        geometry.computeBoundingBox();
        var centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        var mesh = new THREE.Mesh(geometry, materials);
        mesh.position.copy(position).add(new THREE.Vector3(0, 0, 50));
        mesh.rotation.copy(rotation);
        mesh.material[0].color = new THREE.Color(0x2929a3); // Set color for the first material
        mesh.material[1].color = new THREE.Color(0x191966); // Set color for the second material
        scene.add(mesh);
    });
}

// Function to add 3D text to a plane (Details)
function addTextToPlane3(text, position, rotation) {
    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry(text, {
            font: font,
            size: 16,
            height: 2,
            curveSegments: 2
        });

        geometry.computeBoundingBox();
        var centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        var mesh = new THREE.Mesh(geometry, materials);
        mesh.position.copy(position).add(new THREE.Vector3(55, 0, 50));
        mesh.rotation.copy(rotation);
        mesh.material[0].color = new THREE.Color(0x99003d); // Set color for the first material
        mesh.material[1].color = new THREE.Color(0x99003d); // Set color for the second material
        scene.add(mesh);

        gameOverTextMesh = mesh; // Store the game over message object
    });
}

// Function to add 3D text to a plane (details)
function addTextToPlane4(text, position, rotation) {
    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry(text, {
            font: font,
            size: 12,
            height: 0,
            curveSegments: 2
        });

        geometry.computeBoundingBox();
        var centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        var mesh = new THREE.Mesh(geometry, materials);
        mesh.position.copy(position).add(new THREE.Vector3(50, 0, 20));
        mesh.rotation.copy(rotation);
        mesh.material[0].color = new THREE.Color(0x0000b3); // Set color for the first material
        mesh.material[1].color = new THREE.Color(0x0000b3); // Set color for the second material
        scene.add(mesh);
    });
}

// Function to add 3D text to the scene for score display
function addScoreTextToScene() {
    var scoreText = "SCORE\n" + "You: " + winCounts.user1 + "\nPC: " + winCounts.user2; // Initial score text

    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry(scoreText, {
            font: font,
            size: 20,
            height: 2,
            curveSegments: 2
        });

        geometry.computeBoundingBox();

        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        var mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(300, 80, -200); // Adjust position as needed
        mesh.rotation.set(0, -Math.PI / 2, 0); // Adjust rotation as needed
        scene.add(mesh);

        scoreTextMesh = mesh; // Store the score text mesh object
    });
}


function initGame() {

    // Create a 3x3x3 game board
    for (var height = 0; height < boardSize; height++) {
        for (var row = 0; row < boardSize; row++) {
            for (var col = 0; col < boardSize; col++) {
                createTile(row, col, height);
            }
        }
    }

    function createTile(depth, row, col) {
        var tileSize = 50; // Size of the board tile
        var spacing = 5; // Spacing between board tiles

        // Create a cube as the board tile
        //var cubeGeometry = new THREE.BoxGeometry(tileSize, tileSize, 5);
        var cubeGeometry = new THREE.BoxGeometry(tileSize, 5, tileSize);
        var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: emptyTexture });
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        // Add the board tile to the scene and set a unique name
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.name = depth + '' + row + '' + col;
        scene.add(cube);

        // Set the position of the board tile
        var xPosition = col * (tileSize + spacing) - (boardSize - 1) * (tileSize + spacing) / 2;
        var yPosition = row * (tileSize + spacing) - (boardSize - 1) * (tileSize + spacing) / 2;
        //add zPosition
        var zPosition = depth * (tileSize + spacing) - (boardSize - 1) * (tileSize + spacing) / 2;

        cube.position.set(xPosition, yPosition, zPosition);

        // Add the board tile to the scene
        scene.add(cube);

    }

    document.addEventListener('mousedown', onDocumentMouseDown, false);
}



// Function to add a reset button
function initResetButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Play Again';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    button.addEventListener('click', function () {
        button.style.display = "none"; // Hide the button after triggering the click event
        resetGame();
        // refresh page
        //location.reload();
    });
    document.body.appendChild(button);
}


// Reset the game
function resetGame() {
    // Clear the game board
    scene.children.forEach(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.map = emptyTexture;
        }
    });

    // Remove the previous game over message object
    if (gameOverTextMesh) {
        scene.remove(gameOverTextMesh);
        gameOverTextMesh = null; // Reset the variable to null
    }

    // Update scores after showing game over text
    updateScoreDisplay()

    // Reset the game state
    gameActive = true;
    gameEnded = false;
    currentPlayer = 'user1';
}


// Handle mouse click events
function onDocumentMouseDown(event) {
    if (!gameActive) return; // Game over

    event.preventDefault();

    // Get the mouse click position
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Determine the clicked object through raycasting
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Get the clicked object
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        var clickedObject = intersects[0].object;

        // Check if the clicked object is a board tile
        if (clickedObject instanceof THREE.Mesh && clickedObject.material.map === emptyTexture) {
            // Get the name of the board tile, formatted as 'depthrowcol'
            var name = clickedObject.name;
            // Parse out the row, column, and depth
            var depth = parseInt(name.charAt(0));
            var row = parseInt(name.charAt(1));
            var col = parseInt(name.charAt(2));

            // User 1 makes a move
            clickedObject.material.map = xTexture;

            // Check the game status
            checkGameStatus();

            // Computer makes the best move in response
            var bestMove = getBestMove();
            if (bestMove) {
                bestMove.material.map = oTexture;
                checkGameStatus(); // Check the game status
            }

        }
    }
}


// Get the best move for the computer
function getBestMove() {
    var bestMove = null;
    var bestScore = -Infinity;

    // Iterate through all empty board tiles
    for (var depth = 0; depth < boardSize; depth++) {
        for (var row = 0; row < boardSize; row++) {
            for (var col = 0; col < boardSize; col++) {
                var name = depth + '' + row + '' + col; // Name of the corresponding board tile
                var cube = scene.getObjectByName(name);

                // Consider only empty board tiles
                if (cube.material.map === emptyTexture) {

                    // Simulate user making a move at this position
                    cube.material.map = xTexture; // Assume user places here
                    if (checkWinCondition('user1')) {
                        // If user can win, this is the best position for the computer to prevent user from winning
                        cube.material.map = emptyTexture; // Restore original state
                        return cube;
                    }
                    // Restore original state
                    cube.material.map = emptyTexture;

                    // Otherwise, calculate the score of the current position: simulate the move and evaluate the impact of the opponent
                    cube.material.map = oTexture; // Assume opponent places here
                    var score = minimax(depth, false); // false indicates opponent's turn
                    cube.material.map = emptyTexture; // Restore original state

                    // Update the best move position
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = cube;
                    }
                }
            }
        }
    }

    return bestMove;
}


// Minimax algorithm
function minimax(depth, isMaximizing) {
    // Check the game status
    var gameResult = checkGameStatus();

    // If the game is over or the maximum search depth is reached, return the game result
    if (gameResult !== null || depth === 0) {
        return evaluatePosition();
    }

    if (isMaximizing) {
        var bestScore = -Infinity;
        // For each possible move
        for (var depth = 0; depth < boardSize; depth++) {
            for (var row = 0; row < boardSize; row++) {
                for (var col = 0; col < boardSize; col++) {
                    var name = depth + '' + row + '' + col;
                    var cube = scene.getObjectByName(name);
                    if (cube.material.map === emptyTexture) {
                        // Simulate the move
                        cube.material.map = oTexture;
                        // Call the Minimax algorithm
                        var score = minimax(depth - 1, false);
                        // Restore original state
                        cube.material.map = emptyTexture;
                        // Update the best score
                        bestScore = Math.max(bestScore, score);
                    }
                }
            }
        }
        return bestScore;
    } else {
        var bestScore = Infinity;
        // For each possible move
        for (var depth = 0; depth < boardSize; depth++) {
            for (var row = 0; row < boardSize; row++) {
                for (var col = 0; col < boardSize; col++) {
                    var name = depth + '' + row + '' + col;
                    var cube = scene.getObjectByName(name);
                    if (cube.material.map === emptyTexture) {
                        // Simulate the move
                        cube.material.map = xTexture;
                        // Call the Minimax algorithm
                        var score = minimax(depth - 1, true);
                        // Restore original state
                        cube.material.map = emptyTexture;
                        // Update the best score
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
        }
        return bestScore;
    }
}


// Evaluate the score of the current game board
function evaluatePosition() {
    if (checkWinCondition('user1')) {
        return -10; // Opponent wins, return a negative score
    } else if (checkWinCondition('user2')) {
        return 10; // Computer wins, return a positive score
    } else {
        return 0; // Draw or game not yet finished, return a neutral score
    }
}


// Check win condition
function checkWinCondition(player) {
    // Get the texture of the current player
    var playerTexture;
    if (player == 'user1') {
        playerTexture = xTexture;
    } else {
        playerTexture = oTexture;
    }

    // Check rows and columns
    for (var rowH = 0; rowH < boardSize; rowH++) {
        for (var i = 0; i < boardSize; i++) {
            if (
                // Check rows
                (scene.getObjectByName(i + '' + rowH + '0').material.map === playerTexture &&
                    scene.getObjectByName(i + '' + rowH + '1').material.map === playerTexture &&
                    scene.getObjectByName(i + '' + rowH + '2').material.map === playerTexture) ||
                // Check columns
                (scene.getObjectByName(0 + '' + rowH + '' + i).material.map === playerTexture &&
                    scene.getObjectByName(1 + '' + rowH + '' + i).material.map === playerTexture &&
                    scene.getObjectByName(2 + '' + rowH + '' + i).material.map === playerTexture)
            ) {
                return true; // Player wins
            }
        }
    }

    // Check heights
    for (var col = 0; col < boardSize; col++) {
        for (var row = 0; row < boardSize; row++) {
            if (scene.getObjectByName(row + '' + 0 + '' + col).material.map === playerTexture &&
                scene.getObjectByName(row + '' + 1 + '' + col).material.map === playerTexture &&
                scene.getObjectByName(row + '' + 2 + '' + col).material.map === playerTexture) {
                return true;
            }
        }

    }

    // Check planar diagonals
    for (var rowH = 0; rowH < boardSize; rowH++) {
        if (
            (scene.getObjectByName(0 + '' + rowH + '' + 0).material.map === playerTexture &&
                scene.getObjectByName(1 + '' + rowH + '' + 1).material.map === playerTexture &&
                scene.getObjectByName(2 + '' + rowH + '' + 2).material.map === playerTexture) ||
            (scene.getObjectByName(0 + '' + rowH + '' + 2).material.map === playerTexture &&
                scene.getObjectByName(1 + '' + rowH + '' + 1).material.map === playerTexture &&
                scene.getObjectByName(2 + '' + rowH + '' + 0).material.map === playerTexture)
        ) {
            return true; // Player wins
        }
    }

    // Check spatial diagonals
    if (
        (scene.getObjectByName(0 + '' + 0 + '' + 0).material.map === playerTexture &&
            scene.getObjectByName(1 + '' + 1 + '' + 1).material.map === playerTexture &&
            scene.getObjectByName(2 + '' + 2 + '' + 2).material.map === playerTexture) ||
        (scene.getObjectByName(2 + '' + 0 + '' + 2).material.map === playerTexture &&
            scene.getObjectByName(1 + '' + 1 + '' + 1).material.map === playerTexture &&
            scene.getObjectByName(0 + '' + 2 + '' + 0).material.map === playerTexture) ||
        (scene.getObjectByName(0 + '' + 0 + '' + 2).material.map === playerTexture &&
            scene.getObjectByName(1 + '' + 1 + '' + 1).material.map === playerTexture &&
            scene.getObjectByName(2 + '' + 2 + '' + 0).material.map === playerTexture) ||
        (scene.getObjectByName(2 + '' + 0 + '' + 0).material.map === playerTexture &&
            scene.getObjectByName(1 + '' + 1 + '' + 1).material.map === playerTexture &&
            scene.getObjectByName(0 + '' + 2 + '' + 2).material.map === playerTexture)
    ) {
        return true; // Player wins
    }

    // If no win condition, return false
    return false;

}


// Check the game status
function checkGameStatus() {

    // If the game has ended, it returns directly
    if (gameEnded) {
        return;
    }

    // Check win conditions
    if (checkWinCondition('user1')) {
        showGameOverText('You win ! ! !');
        winCounts['user1']++; // Increment win count for user1
        // Output win counts to the console
        console.log("Player : Computer = " + winCounts['user1'] + " : " + winCounts['user2']);
        initResetButton(); // Add reset button
        gameActive = false;
        gameEnded = true;
    } else if (checkWinCondition('user2')) {
        showGameOverText('You Lose . . .');
        winCounts['user2']++; // Increment win count for user2
        // Output win counts to the console
        console.log("Player : Computer = " + winCounts['user1'] + " : " + winCounts['user2']);
        initResetButton(); // Add reset button
        gameActive = false;
        gameEnded = true;
    }

    // Check if all tiles are occupied
    var allTilesOccupied = true;
    scene.children.forEach(function (child) {
        if (child instanceof THREE.Mesh && child.material.map === emptyTexture) {
            allTilesOccupied = false;
        }
    });

    // If all tiles are occupied, display Game Over text and Play Again button
    if (allTilesOccupied) {
        showGameOverText("Game Over !");
        initResetButton(); // Add reset button
        gameActive = false; // Game over
        gameEnded = true;
    }

}


// Display Game Over text
function showGameOverText(message) {
    // If the game has ended, it returns directly to
    if (gameEnded) {
        return;
    }
    console.log(message); // Output game result to console
    let messageText;
    if (message != null) {
        messageText = message;
    } else {
        messageText = "Game Over !";
    }
    // Display Game Over text in 3D space
    addTextToPlane3(messageText, new THREE.Vector3(-110, 20, 0), new THREE.Euler(0, 0, 0));

    // Set gameEnded to true to avoid calling this method multiple times.
    gameEnded = true;

}


// Function to update the score display
function updateScoreDisplay() {
    var scoreText = "SCORE\n" + "You: " + winCounts['user1'] + "\nPC: " + winCounts['user2']; // Initial score text

    // Dispose existing scoreTextMesh if it exists
    if (scoreTextMesh) {
        scene.remove(scoreTextMesh);
        scoreTextMesh.geometry.dispose();
        //scoreTextMesh.material.dispose();
    }

    // Create new scoreTextMesh
    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry(scoreText, {
            font: font,
            size: 20,
            height: 2,
            curveSegments: 2
        });

        geometry.computeBoundingBox();

        var materials = [
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, overdraw: 0.5 }),
            new THREE.MeshBasicMaterial({ color: 0x8000ff, overdraw: 0.6 })
        ];

        var mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(300, 80, -200); // Adjust position as needed
        mesh.rotation.set(0, -Math.PI / 2, 0); // Adjust rotation as needed
        scene.add(mesh);

        scoreTextMesh = mesh; // Store the new score text mesh object
    });
}

