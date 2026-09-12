import { Physics, useBox, useSphere } from "@react-three/cannon";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  type InstancedMesh,
  Matrix4,
  type Mesh,
  OrthographicCamera,
  Plane,
  Raycaster,
  Shape,
  type Sprite,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import BallMixBurst, { type BurstWave } from "./BallMixBurst";
import { BALL_MIX_CONFIG } from "./ballMixConfig";
import {
  BALL_RADIUS,
  type BallVector,
  burstImpulse,
  CHAMBER_HALF_DEPTH,
  CHAMBER_RADIUS,
  constrainBall,
  mixingImpulse,
} from "./ballMixPhysics";

export type BallMixProps = {
  running: boolean;
  onReady: () => void;
  onFailure: () => void;
};
type BurstInput = { x: number; y: number; id: number };
const COUNT = 45;
const RADIUS = BALL_RADIUS;
const numbers = Array.from({ length: COUNT }, (_, index) => index + 1);

function initialPosition(index: number): [number, number, number] {
  const angle = index * 2.399963;
  const radius = 0.5 + Math.sqrt(index / COUNT) * 2.6;
  return [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    ((index % 3) - 1) * 0.5,
  ];
}

function numberTexture(number: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("번호 라벨을 만들 수 없어요.");
  context.fillStyle = "#fffef8";
  context.beginPath();
  context.arc(32, 32, 29, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#17231d";
  context.font = "bold 36px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(number), 32, 34);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Balls({
  running,
  burst,
  wave,
}: {
  running: boolean;
  burst: RefObject<BurstInput>;
  wave: RefObject<BurstWave>;
}) {
  const [ref, api] = useSphere<InstancedMesh>((index) => ({
    args: [RADIUS],
    mass: 1,
    position: initialPosition(index),
    velocity: [
      -initialPosition(index)[1] * 0.2 * BALL_MIX_CONFIG.mixSpeed,
      initialPosition(index)[0] * 0.2 * BALL_MIX_CONFIG.mixSpeed,
      0,
    ],
    linearDamping: 0.3,
    angularDamping: 0.5,
    material: { friction: 0.08, restitution: 0.28 },
  }));
  const bodies = useMemo(() => numbers.map((_, index) => api.at(index)), [api]);
  const velocities = useRef<BallVector[]>(numbers.map(() => [0, 0, 0]));
  const labels = useRef<(Sprite | null)[]>([]);
  const textures = useMemo(() => numbers.map(numberTexture), []);
  const matrix = useMemo(() => new Matrix4(), []);
  const position = useMemo(() => new Vector3(), []);
  const pointerPosition = useMemo(() => new Vector3(), []);
  const coordinates = useMemo(() => new Vector2(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const time = useRef(0);
  const lastBurst = useRef(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    numbers.forEach((number, index) => {
      ref.current?.setColorAt(index, new Color(lottoNumberBg(number)));
    });
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [ref]);
  useEffect(() => {
    const subscriptions = bodies.map((body, index) =>
      body.velocity.subscribe((value) => {
        velocities.current[index] = value;
      }),
    );
    return () => {
      for (const unsubscribe of subscriptions) unsubscribe();
    };
  }, [bodies]);
  useEffect(
    () => () => {
      for (const texture of textures) texture.dispose();
    },
    [textures],
  );
  useFrame(({ camera }, delta) => {
    if (!ref.current) return;
    if (running) time.current += Math.min(delta, 1 / 30);
    let push: BallVector | null = null;
    if (!running) lastBurst.current = burst.current.id;
    if (running && burst.current.id !== lastBurst.current) {
      lastBurst.current = burst.current.id;
      raycaster.setFromCamera(
        coordinates.set(burst.current.x, burst.current.y),
        camera,
      );
      if (
        raycaster.ray.intersectPlane(plane, pointerPosition) &&
        Math.hypot(pointerPosition.x, pointerPosition.y) < CHAMBER_RADIUS
      ) {
        push = [pointerPosition.x, pointerPosition.y, 0];
        wave.current = { position: push, age: 0, active: true };
      }
    }
    for (let index = 0; index < COUNT; index++) {
      ref.current.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      const state = constrainBall(
        [position.x, position.y, position.z],
        velocities.current[index],
      );
      const [x, y, z] = state.position;
      if (state.corrected) {
        matrix.setPosition(x, y, z);
        ref.current.setMatrixAt(index, matrix);
        ref.current.instanceMatrix.needsUpdate = true;
        if (running) {
          bodies[index].position.set(x, y, z);
          bodies[index].velocity.set(...state.velocity);
          velocities.current[index] = state.velocity;
        }
      }
      labels.current[index]?.position.set(x, y, z + RADIUS + 0.02);
      if (running) {
        const impulse = mixingImpulse(
          state.position,
          state.velocity,
          time.current,
          index,
          delta,
        );
        if (push) {
          const burstKick = burstImpulse(state.position, push, index);
          for (let axis = 0; axis < 3; axis++) impulse[axis] += burstKick[axis];
        }
        const bounded = constrainBall(state.position, [
          state.velocity[0] + impulse[0],
          state.velocity[1] + impulse[1],
          state.velocity[2] + impulse[2],
        ]);
        bodies[index].applyImpulse(
          [
            bounded.velocity[0] - state.velocity[0],
            bounded.velocity[1] - state.velocity[1],
            bounded.velocity[2] - state.velocity[2],
          ],
          [0, 0, 0],
        );
      }
    }
  });
  return (
    <>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[RADIUS, 24, 18]} />
        <meshStandardMaterial roughness={0.38} metalness={0.02} />
      </instancedMesh>
      {numbers.map((number, index) => (
        <sprite
          key={number}
          ref={(sprite) => {
            labels.current[index] = sprite;
          }}
          position={initialPosition(index)}
          scale={[0.36, 0.36, 1]}
        >
          <spriteMaterial
            map={textures[index]}
            transparent
            depthWrite={false}
          />
        </sprite>
      ))}
    </>
  );
}

function Wall({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
}) {
  const [ref] = useBox<Mesh>(() => ({
    type: "Static",
    args: size,
    position,
    rotation,
  }));
  return <mesh ref={ref} visible={false} />;
}
function roundedPanel(width: number, height: number, radius: number) {
  const x = -width / 2,
    y = -height / 2;
  const shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function chamberTexture(shadow = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("체험 배경을 만들 수 없어요.");
  const gradient = context.createRadialGradient(
    64,
    shadow ? 64 : 36,
    4,
    64,
    64,
    64,
  );
  gradient.addColorStop(0, shadow ? "rgba(23,65,47,0.18)" : "#f8fffb");
  gradient.addColorStop(1, shadow ? "rgba(23,65,47,0)" : "#b8dccc");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function StandLogo() {
  const svg = useLoader(SVGLoader, "/images/symbol_logo.svg");
  const parts = useMemo(
    () =>
      svg.paths.flatMap((path, pathIndex) =>
        path.toShapes().map((shape, shapeIndex) => ({
          shape,
          color: path.color,
          key: `${pathIndex}-${shapeIndex}`,
        })),
      ),
    [svg],
  );
  // Preserve the source SVG's colours and viewBox, as crisp vector geometry.
  return (
    <group position={[-0.22, -3.91, 0.7]} scale={[0.44 / 500, -0.44 / 500, 1]}>
      {parts.map(({ shape, color, key }) => (
        <mesh key={key}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial
            color={color}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Chamber() {
  const backdrop = useMemo(() => chamberTexture(), []);
  const shadow = useMemo(() => chamberTexture(true), []);
  const stand = useMemo(() => roundedPanel(3.25, 0.62, 0.22), []);
  const support = useMemo(() => roundedPanel(0.28, 0.75, 0.12), []);
  useEffect(
    () => () => {
      backdrop.dispose();
      shadow.dispose();
    },
    [backdrop, shadow],
  );
  const wallCount = 32;
  const wallThickness = 0.9;
  const wallRadius = CHAMBER_RADIUS + wallThickness / 2;
  const wallWidth =
    2 * (CHAMBER_RADIUS + wallThickness) * Math.tan(Math.PI / wallCount) + 0.08;
  return (
    <>
      {Array.from({ length: wallCount }, (_, index) => {
        const angle = (index / wallCount) * Math.PI * 2;
        return (
          <Wall
            key={index}
            position={[
              Math.cos(angle) * wallRadius,
              Math.sin(angle) * wallRadius,
              0,
            ]}
            rotation={[0, 0, angle]}
            size={[wallThickness, wallWidth, 3]}
          />
        );
      })}
      <Wall
        position={[0, 0, -CHAMBER_HALF_DEPTH - 0.3]}
        rotation={[0, 0, 0]}
        size={[9, 9, 0.6]}
      />
      <Wall
        position={[0, 0, CHAMBER_HALF_DEPTH + 0.3]}
        rotation={[0, 0, 0]}
        size={[9, 9, 0.6]}
      />
      <mesh position={[0, -4.45, -1.6]} scale={[5.3, 0.48, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={shadow}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -1.2]}>
        <circleGeometry args={[3.76, 80]} />
        <meshBasicMaterial map={backdrop} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.69, 3.69, 2.35, 80, 1, true]} />
        <meshStandardMaterial
          color="#a4ccba"
          transparent
          opacity={0.16}
          depthWrite={false}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0, 1.28]}>
        <torusGeometry args={[3.75, 0.12, 16, 96]} />
        <meshStandardMaterial
          color="#94bfa8"
          roughness={0.58}
          metalness={0.03}
        />
      </mesh>
      <mesh position={[0, 0, 1.29]}>
        <torusGeometry args={[3.86, 0.035, 12, 96]} />
        <meshStandardMaterial
          color="#d7e8df"
          roughness={0.32}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[0, 0, 1.3]}>
        <torusGeometry args={[3.61, 0.026, 10, 96]} />
        <meshStandardMaterial color="#ddf0e5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 1.31]} rotation={[0, 0, 0.72]}>
        <torusGeometry args={[3.42, 0.022, 8, 32, 0.68]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 1.32]} rotation={[0, 0, 3.7]}>
        <torusGeometry args={[3.42, 0.014, 8, 24, 0.4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh
          key={x}
          position={[x, -3.61, -1.75]}
          rotation={[0, 0, x > 0 ? -0.15 : 0.15]}
        >
          <extrudeGeometry
            args={[
              support,
              {
                depth: 0.4,
                bevelEnabled: true,
                bevelSize: 0.06,
                bevelThickness: 0.06,
                bevelSegments: 4,
                steps: 1,
              },
            ]}
          />
          <meshStandardMaterial
            color="#6baf90"
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      ))}
      <mesh position={[0, -4.07, -0.12]}>
        <extrudeGeometry
          args={[
            stand,
            {
              depth: 0.65,
              bevelEnabled: true,
              bevelSize: 0.1,
              bevelThickness: 0.1,
              bevelSegments: 5,
              steps: 1,
            },
          ]}
        />
        <meshStandardMaterial
          color="#eff8f1"
          roughness={0.45}
          metalness={0.03}
        />
      </mesh>
      <StandLogo />
    </>
  );
}

function SceneLifecycle({ onReady, onFailure, running }: BallMixProps) {
  const { gl, camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    if (camera instanceof OrthographicCamera) {
      camera.zoom = Math.min(size.width / 9.4, size.height / 10.3);
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, size.width, size.height, invalidate]);
  useEffect(() => {
    if (!running) invalidate();
  }, [running, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener("webglcontextlost", lost);
    onReady();
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onReady, onFailure]);
  return null;
}

export default function BallMix(props: BallMixProps) {
  const burst = useRef<BurstInput>({ x: 0, y: 0, id: 0 });
  const wave = useRef<BurstWave>({
    position: [0, 0, 0],
    age: 0,
    active: false,
  });
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const lastTrigger = useRef(-Infinity);
  function triggerBurst(x: number, y: number) {
    if (!props.running) return;
    const now = performance.now();
    if (now - lastTrigger.current < BALL_MIX_CONFIG.burstCooldownMs) return;
    lastTrigger.current = now;
    burst.current = { x, y, id: burst.current.id + 1 };
  }
  return (
    <Canvas
      orthographic
      camera={{ position: [0, -0.3, 16], zoom: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={props.running ? "always" : "demand"}
      style={{
        touchAction: "pan-y",
        cursor: props.running ? "pointer" : "default",
      }}
      role="button"
      tabIndex={props.running ? 0 : -1}
      aria-disabled={!props.running}
      aria-label="추첨기 공 흩뜨리기"
      aria-describedby="ball-experience-help"
      onKeyDown={(event) => {
        if (event.repeat || (event.key !== "Enter" && event.key !== " "))
          return;
        if (!props.running) return;
        event.preventDefault();
        triggerBurst(0, 0);
      }}
      onPointerDown={(event) => {
        if (!props.running || !event.isPrimary || event.button !== 0) return;
        press.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        const start = press.current;
        if (
          start &&
          (start.id !== event.pointerId ||
            Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10)
        )
          press.current = null;
      }}
      onPointerLeave={() => {
        press.current = null;
      }}
      onPointerCancel={() => {
        press.current = null;
      }}
      onPointerUp={(event) => {
        const start = press.current;
        press.current = null;
        if (
          !start ||
          start.id !== event.pointerId ||
          event.button !== 0 ||
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        triggerBurst(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
      }}
    >
      <hemisphereLight args={["#ffffff", "#709581", 1.8]} />
      <directionalLight position={[-3, 5, 8]} intensity={1.8} />
      <SceneLifecycle {...props} />
      <Physics
        gravity={[0, -1.2, 0]}
        isPaused={!props.running}
        iterations={12}
        stepSize={1 / 120}
        maxSubSteps={6}
        size={96}
        broadphase="SAP"
        shouldInvalidate={props.running}
      >
        <Chamber />
        <Balls running={props.running} burst={burst} wave={wave} />
        <BallMixBurst running={props.running} wave={wave} />
      </Physics>
    </Canvas>
  );
}
