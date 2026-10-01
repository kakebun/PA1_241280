const STUDENT_ID = "241280";
const OX = 0.15;
const OY = 0.15;

function applyDepthOffset(x, y, z) {
  const xdraw = x + OX * (z + 0.5);
  const ydraw = y + OY * (z + 0.5);
  return [xdraw, ydraw, z];
}

main();

function main() {
  /*========== Create a WebGL Context ==========*/
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL unavailable");
    return;
  }

  /*========== Define and Store the Geometry ==========*/
  // Cube geometry (Left side)
  const rawCubeVertices = [
    // Front face
    -0.8, -0.25, -0.5,  -0.3, -0.25, -0.5,  -0.3,  0.25, -0.5,
    -0.8, -0.25, -0.5,  -0.3,  0.25, -0.5,  -0.8,  0.25, -0.5,
    // Back face
    -0.8, -0.25,  0.5,  -0.8,  0.25,  0.5,  -0.3,  0.25,  0.5,
    -0.8, -0.25,  0.5,  -0.3,  0.25,  0.5,  -0.3, -0.25,  0.5,
    // Top face
    -0.8,  0.25, -0.5,  -0.3,  0.25, -0.5,  -0.3,  0.25,  0.5,
    -0.8,  0.25, -0.5,  -0.3,  0.25,  0.5,  -0.8,  0.25,  0.5,
    // Bottom face
    -0.8, -0.25, -0.5,  -0.8, -0.25,  0.5,  -0.3, -0.25,  0.5,
    -0.8, -0.25, -0.5,  -0.3, -0.25,  0.5,  -0.3, -0.25, -0.5,
    // Right face
    -0.3, -0.25, -0.5,  -0.3, -0.25,  0.5,  -0.3,  0.25,  0.5,
    -0.3, -0.25, -0.5,  -0.3,  0.25,  0.5,  -0.3,  0.25, -0.5,
    // Left face
    -0.8, -0.25, -0.5,  -0.8,  0.25, -0.5,  -0.8,  0.25,  0.5,
    -0.8, -0.25, -0.5,  -0.8,  0.25,  0.5,  -0.8, -0.25,  0.5
  ];

  // Square pyramid geometry (Right side)
  const rawSolidVertices = [
    // Base
    0.3, -0.25, -0.5,   0.8, -0.25, -0.5,   0.8, -0.25,  0.5,
    0.3, -0.25, -0.5,   0.8, -0.25,  0.5,   0.3, -0.25,  0.5,
    // Front face
    0.3, -0.25, -0.5,   0.8, -0.25, -0.5,   0.55, 0.3,   0.0,
    // Right face
    0.8, -0.25, -0.5,   0.8, -0.25,  0.5,   0.55, 0.3,   0.0,
    // Back face
    0.8, -0.25,  0.5,   0.3, -0.25,  0.5,   0.55, 0.3,   0.0,
    // Left face
    0.3, -0.25,  0.5,   0.3, -0.25, -0.5,   0.55, 0.3,   0.0
  ];

  const positions = [];
  for (let i = 0; i < rawCubeVertices.length; i += 3) {
    const p = applyDepthOffset(rawCubeVertices[i], rawCubeVertices[i+1], rawCubeVertices[i+2]);
    positions.push(...p);
  }
  const cubeVertexCount = rawCubeVertices.length / 3;

  for (let i = 0; i < rawSolidVertices.length; i += 3) {
    const p = applyDepthOffset(rawSolidVertices[i], rawSolidVertices[i+1], rawSolidVertices[i+2]);
    positions.push(...p);
  }
  const solidVertexCount = rawSolidVertices.length / 3;

  // Vertex colors
  const colors = [];
  function addColors(count, r, g, b, a, isGradient = false) {
    for (let i = 0; i < count; i++) {
      if (isGradient) {
        colors.push(r * (i / count), g, b * (1 - i / count), a);
      } else {
        colors.push(r, g, b, a);
      }
    }
  }

  // Cube colors
  addColors(6, 1.0, 0.2, 0.2, 1.0, true);
  addColors(6, 0.2, 0.8, 0.2, 1.0);
  addColors(6, 0.2, 0.2, 0.9, 1.0);
  addColors(6, 0.9, 0.9, 0.2, 1.0);
  addColors(6, 0.9, 0.2, 0.9, 1.0);
  addColors(6, 0.2, 0.9, 0.9, 1.0);

  // Pyramid colors
  addColors(6, 0.5, 0.5, 0.5, 1.0);
  addColors(3, 1.0, 0.5, 0.0, 1.0, true);
  addColors(3, 0.8, 0.1, 0.4, 1.0);
  addColors(3, 0.1, 0.7, 0.5, 1.0);
  addColors(3, 0.6, 0.3, 0.8, 1.0);

  const buffers = initBuffers(gl, positions, colors);

  /*========== Shaders ==========*/
  const vsSource = `
    attribute vec3 aPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    void main() {
      gl_Position = vec4(aPosition, 1.0);
      gl_PointSize = 6.0;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  const program = createProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  /*====== Connect attributes with vertex shader ======*/
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  const aVertexColor = gl.getAttribLocation(program, "aVertexColor");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexColor);

  /*========== Drawing & Controls ==========*/
  const state = {
    mode: gl.TRIANGLES,
    modeName: "gl.TRIANGLES",
    depth: true,
    cubeFirst: true
  };

  const statusLabel = document.querySelector("#status");

  function render() {
    if (state.depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const drawCube = () => gl.drawArrays(state.mode, 0, cubeVertexCount);
    const drawSolid = () => gl.drawArrays(state.mode, cubeVertexCount, solidVertexCount);

    if (state.cubeFirst) {
      drawCube();
      drawSolid();
    } else {
      drawSolid();
      drawCube();
    }

    statusLabel.textContent = `ID: ${STUDENT_ID} | Mode: ${state.modeName} | Depth: ${state.depth ? "ON" : "OFF"} | Order: ${state.cubeFirst ? "Cube First" : "Solid First"}`;
  }

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "1": state.mode = gl.TRIANGLES; state.modeName = "gl.TRIANGLES"; break;
      case "2": state.mode = gl.LINE_LOOP; state.modeName = "gl.LINE_LOOP"; break;
      case "3": state.mode = gl.LINES; state.modeName = "gl.LINES"; break;
      case "4": state.mode = gl.LINE_STRIP; state.modeName = "gl.LINE_STRIP"; break;
      case "5": state.mode = gl.POINTS; state.modeName = "gl.POINTS"; break;
      case "6": state.mode = gl.TRIANGLE_STRIP; state.modeName = "gl.TRIANGLE_STRIP"; break;
      case "d": case "D": state.depth = !state.depth; break;
      case "s": case "S": state.cubeFirst = !state.cubeFirst; break;
    }
    render();
  });

  render();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function initBuffers(gl, positions, colors) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return { position: positionBuffer, color: colorBuffer };
}