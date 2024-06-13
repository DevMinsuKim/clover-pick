"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import React, { MutableRefObject, useEffect } from "react";

interface MixProps {
  mat?: THREE.Matrix4;
  vec?: THREE.Vector3;
  [key: string]: any;
}

const count = 40;
const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const baubleMaterial = new THREE.MeshStandardMaterial({});

const getRandomColor = (): THREE.Color => {
  const pastelColors = [
    "#fbc400",
    "#69c8f2",
    "#ff7272",
    "#ff7272",
    "#aaaaaa",
    "#b0d840",
  ];
  const randomIndex = Math.floor(Math.random() * pastelColors.length);
  return new THREE.Color(pastelColors[randomIndex]);
};

const Mix = ({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  ...props
}: MixProps) => {
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
        ref.current.getMatrixAt(i, mat);
        api
          .at(i)
          .applyForce(
            vec
              .setFromMatrixPosition(mat)
              .normalize()
              .multiplyScalar(-50)
              .toArray(),
            [0, 0, 0],
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
    }
  }, [ref]);

  const viewport = useThree((state) => state.viewport);

  const isMobile = window.innerWidth < 768;
  const responsiveRato = viewport.width / 12;

  // useFrame(() => {
  //   console.log(window.innerWidth, window.innerHeight);
  //   ref.current.scale.set(
  //     window.innerWidth / 1000,
  //     window.innerHeight / 1000,
  //     1,
  //   );
  //   // ref.current.position.set(
  //   //   window.innerWidth / 2000,
  //   //   window.innerHeight / 2000,
  //   //   0,
  //   // );
  // });

  return (
    <instancedMesh
      scale={[isMobile ? 1 : 2, isMobile ? 1 : 2, 1]}
      ref={ref}
      castShadow
      receiveShadow
      args={[sphereGeometry, baubleMaterial, count]}
    />
  );
};

const Pointer = () => {
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
      0,
    ),
  );
};

const Responsive = () => {
  // const { size, setSize } = useThree();
  // useEffect(() => {
  //   function handleResize() {
  //     setSize(window.innerWidth / 2, window.innerHeight / 2);
  //   }
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [setSize]);
  // return null;
  // const { viewport } = useThree();
  // console.log(viewport.width, viewport.height);
  // return null;
};

export default function BallMix() {
  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <color attach="background" args={["#f0f0f0"]} />
      {/* <Responsive /> */}
      <hemisphereLight args={[0xffffff, 0x888888, 4]} />
      <Physics gravity={[0, 2, 0]} iterations={10}>
        <Pointer />
        <Mix />
      </Physics>
    </Canvas>
  );
}
