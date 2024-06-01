"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import React, { MutableRefObject, useEffect, useState } from "react";
import { Environment, useTexture } from "@react-three/drei";

interface MixProps {
  mat?: THREE.Matrix4;
  vec?: THREE.Vector3;
  [key: string]: any;
}

const count = 40;
const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const baubleMaterial = new THREE.MeshStandardMaterial({});

function getRandomColor(): THREE.Color {
  const pastelColors = [
    "#FFB3BA",
    "#FFDFBA",
    "#FFFFBA",
    "#BAE1FF",
    "#D7BAFF",
    "#BEBEBE",
  ];
  const randomIndex = Math.floor(Math.random() * pastelColors.length);
  return new THREE.Color(pastelColors[randomIndex]);
}

function Mix({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  ...props
}: MixProps) {
  const texture = useTexture("/images/test.svg");
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(10), rfs(10), rfs(10)],
  })) as [MutableRefObject<THREE.InstancedMesh>, any];

  useFrame(() => {
    if (ref.current) {
      for (let i = 0; i < count; i++) {
        (ref.current as THREE.InstancedMesh).getMatrixAt(i, mat);
        api
          .at(i)
          .applyForce(
            vec
              .setFromMatrixPosition(mat)
              .normalize()
              .multiplyScalar(-50)
              .toArray(),
            [0, 0, 0]
          );
      }
    }
  });

  useEffect(() => {
    if (ref.current) {
      for (let i = 0; i < count; i++) {
        const color = getRandomColor();
        ref.current.setColorAt(i, color);
      }
      // ref.current.instanceColor!.needsUpdate = true;
    }
  }, []);

  return (
    <instancedMesh
      ref={ref}
      castShadow
      receiveShadow
      args={[sphereGeometry, baubleMaterial, count]}
      // material-map={texture}
    />
  );
}

function Pointer() {
  const viewport = useThree((state) => state.viewport);
  const [, api] = useSphere(() => ({
    type: "Kinematic",
    args: [3],
    position: [0, 0, 0],
  }));
  return useFrame((state) =>
    api.position.set(
      (state.mouse.x * viewport.width) / 2,
      (state.mouse.y * viewport.height) / 2,
      0
    )
  );
}

export default function BallClump() {
  return (
    <div className="w-[500px] h-[600px]">
      <Canvas
        shadows
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 100, near: 1, far: 100 }}
      >
        <ambientLight intensity={0.2} />
        {/* <color attach="background" args={["#dfdfdf"]} /> */}
        <spotLight
          intensity={1}
          angle={0.2}
          penumbra={1}
          position={[30, 30, 30]}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <Physics gravity={[0, 2, 0]} iterations={10}>
          <Pointer />
          <Mix />
        </Physics>
        <Environment files="/images/metal.hdr" />
      </Canvas>
    </div>
  );
}
