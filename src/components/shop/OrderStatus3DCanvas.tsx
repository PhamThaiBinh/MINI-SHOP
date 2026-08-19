"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CheckCircle2, Truck, Check, Sparkles, RotateCw, Box } from "lucide-react";

interface OrderStatus3DCanvasProps {
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled" | string;
  orderId: string;
}

export const OrderStatus3DCanvas: React.FC<OrderStatus3DCanvasProps> = ({
  status,
  orderId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<string>(status);

  // Sync internal active stage when prop changes
  useEffect(() => {
    setActiveStage(status);
  }, [status]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Width & Height of container
    const width = container.clientWidth || 600;
    const height = 340;

    // 1. Scene - Soft Studio Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfbf9);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 1.1, 0);

    // 3. WebGL Renderer with High Quality Shadows & Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clean container before appending canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Pixar Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xe2e8f0, 0.9);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // Key Light (Warm Sunlight)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    // Rim Light (Cyan/Emerald backlight for Pixar glow edges)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);

    // 5. Soft Ground Shadow Disk
    const groundGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.04, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });
    const groundDisk = new THREE.Mesh(groundGeo, groundMat);
    groundDisk.position.set(0, 0, 0);
    groundDisk.receiveShadow = true;
    scene.add(groundDisk);

    // 6. Stage Container Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    let animFrameId: number;
    let clock = new THREE.Clock();

    // =========================================================================
    // STAGE 1: Pending / Order Confirmation (Pixar Toy Receipt & Seal Stamp)
    // =========================================================================
    const buildStagePending = () => {
      const receiptGroup = new THREE.Group();

      // Soft Rounded Toy Paper Sheet
      const paperGeo = new THREE.BoxGeometry(2.4, 0.08, 3.4);
      const paperMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      });
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.set(0, 1.2, 0);
      paper.castShadow = true;
      receiptGroup.add(paper);

      // Printed Lines
      const lineMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
      for (let i = 0; i < 5; i++) {
        const lineGeo = new THREE.BoxGeometry(1.6, 0.04, 0.18);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(0, 1.25, -1.1 + i * 0.45);
        receiptGroup.add(line);
      }

      // Pixar Emerald Confirmed Stamp Seal
      const stampGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.22, 32);
      const stampMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.2,
        metalness: 0.1,
      });
      const stamp = new THREE.Mesh(stampGeo, stampMat);
      stamp.position.set(0, 1.45, 0.5);
      stamp.castShadow = true;
      receiptGroup.add(stamp);

      // Glowing Inner Ring
      const ringGeo = new THREE.TorusGeometry(0.52, 0.05, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xa7f3d0,
        emissive: 0x34d399,
        emissiveIntensity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 1.57, 0.5);
      receiptGroup.add(ring);

      // Floating Toy Star Particles
      const starsGroup = new THREE.Group();
      const starGeo = new THREE.OctahedronGeometry(0.12);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.6,
      });
      for (let i = 0; i < 8; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        const angle = (i / 8) * Math.PI * 2;
        star.position.set(Math.cos(angle) * 1.8, 1.6 + (i % 2) * 0.3, Math.sin(angle) * 1.8);
        starsGroup.add(star);
      }
      receiptGroup.add(starsGroup);

      stageGroup.add(receiptGroup);

      return (delta: number, time: number) => {
        receiptGroup.position.y = Math.sin(time * 2.5) * 0.08;
        starsGroup.rotation.y = time * 1.2;
      };
    };

    // =========================================================================
    // STAGE 2: Processing / Packing (Pixar Toy Cardboard Box)
    // =========================================================================
    const buildStageProcessing = () => {
      const packingGroup = new THREE.Group();

      // Conveyor Platform
      const platformGeo = new THREE.BoxGeometry(4.2, 0.25, 2.2);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(0, 0.12, 0);
      platform.receiveShadow = true;
      packingGroup.add(platform);

      // Pixar Toy Cardboard Box (Warm Orange Clay)
      const boxGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 1.15, 0);
      box.castShadow = true;
      packingGroup.add(box);

      // Emerald Tape Strip
      const tapeGeo = new THREE.BoxGeometry(2.25, 0.08, 0.35);
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.set(0, 2.06, 0);
      packingGroup.add(tape);

      // Barcode Sticker
      const stickerGeo = new THREE.BoxGeometry(0.04, 0.7, 0.9);
      const stickerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sticker = new THREE.Mesh(stickerGeo, stickerMat);
      sticker.position.set(1.12, 1.15, 0);
      packingGroup.add(sticker);

      stageGroup.add(packingGroup);

      return (delta: number, time: number) => {
        box.position.y = 1.15 + Math.abs(Math.sin(time * 3)) * 0.06;
        tape.position.y = box.position.y + 0.91;
        sticker.position.y = box.position.y;
      };
    };

    // =========================================================================
    // STAGE 3: Shipping (MATCHING REFERENCE IMAGE: Pixar Yellow Vespa & Purple Rider)
    // =========================================================================
    const buildStageShipping = () => {
      const shippingGroup = new THREE.Group();

      // Road Strip
      const roadGeo = new THREE.BoxGeometry(9, 0.08, 2.6);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.04, 0);
      road.receiveShadow = true;
      shippingGroup.add(road);

      // Moving Road Dashes
      const dashesGroup = new THREE.Group();
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let i = -4.5; i <= 4.5; i += 2.2) {
        const dashGeo = new THREE.BoxGeometry(0.9, 0.09, 0.16);
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.position.set(i, 0.05, 0);
        dashesGroup.add(dash);
      }
      shippingGroup.add(dashesGroup);

      // Scooter + Rider Assembly
      const scooterRiderGroup = new THREE.Group();
      scooterRiderGroup.position.set(0, 0.65, 0);

      // --- A. RETRO PIXAR YELLOW VESPA SCOOTER ---
      const vespaYellow = 0xfacc15; // Vibrant Yellow matching reference
      const vespaMat = new THREE.MeshStandardMaterial({ color: vespaYellow, roughness: 0.3, metalness: 0.1 });
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });

      // Curved Front Apron
      const apronGeo = new THREE.CylinderGeometry(0.45, 0.55, 1.1, 24);
      const apron = new THREE.Mesh(apronGeo, vespaMat);
      apron.rotation.z = -0.3;
      apron.position.set(0.85, 0.65, 0);
      apron.castShadow = true;
      scooterRiderGroup.add(apron);

      // 3 VERTICAL GLOWING LED FRONT LIGHTS (EXACTLY MATCHING REFERENCE IMAGE)
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.8,
      });
      for (let i = 0; i < 3; i++) {
        const ledGeo = new THREE.SphereGeometry(0.07, 16, 16);
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(1.15, 0.82 - i * 0.18, 0);
        scooterRiderGroup.add(led);
      }

      // Front Mudguard
      const mudguardGeo = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const mudguard = new THREE.Mesh(mudguardGeo, vespaMat);
      mudguard.position.set(1.05, 0.2, 0);
      scooterRiderGroup.add(mudguard);

      // Rear Body Shell (Yellow Curve & Black Side Pod Covers)
      const rearBodyGeo = new THREE.SphereGeometry(0.7, 24, 24);
      const rearBody = new THREE.Mesh(rearBodyGeo, vespaMat);
      rearBody.scale.set(1.4, 0.95, 1.0);
      rearBody.position.set(-0.5, 0.5, 0);
      rearBody.castShadow = true;
      scooterRiderGroup.add(rearBody);

      // Black Side Pod Covers
      const sidePodGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const sidePodLeft = new THREE.Mesh(sidePodGeo, blackMat);
      sidePodLeft.scale.set(1.2, 0.8, 0.4);
      sidePodLeft.position.set(-0.5, 0.4, 0.52);
      scooterRiderGroup.add(sidePodLeft);

      const sidePodRight = new THREE.Mesh(sidePodGeo, blackMat);
      sidePodRight.scale.set(1.2, 0.8, 0.4);
      sidePodRight.position.set(-0.5, 0.4, -0.52);
      scooterRiderGroup.add(sidePodRight);

      // Handlebars & Headlight Cowl
      const cowlGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const cowl = new THREE.Mesh(cowlGeo, vespaMat);
      cowl.position.set(0.68, 1.25, 0);
      scooterRiderGroup.add(cowl);

      const mainHeadlightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
      const mainHeadlight = new THREE.Mesh(mainHeadlightGeo, ledMat);
      mainHeadlight.rotation.z = Math.PI / 2;
      mainHeadlight.position.set(0.9, 1.25, 0);
      scooterRiderGroup.add(mainHeadlight);

      // Wheels
      const tireGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.22, 24);
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.23, 16);

      const wheelFront = new THREE.Group();
      wheelFront.position.set(1.05, -0.22, 0);
      const tF = new THREE.Mesh(tireGeo, blackMat);
      tF.rotation.x = Math.PI / 2;
      const rF = new THREE.Mesh(rimGeo, chromeMat);
      rF.rotation.x = Math.PI / 2;
      wheelFront.add(tF, rF);
      scooterRiderGroup.add(wheelFront);

      const wheelBack = new THREE.Group();
      wheelBack.position.set(-0.85, -0.22, 0);
      const tB = new THREE.Mesh(tireGeo, blackMat);
      tB.rotation.x = Math.PI / 2;
      const rB = new THREE.Mesh(rimGeo, chromeMat);
      rB.rotation.x = Math.PI / 2;
      wheelBack.add(tB, rB);
      scooterRiderGroup.add(wheelBack);

      // Yellow Delivery Box / Backpack on Back Rack (Matching Reference)
      const deliveryBoxGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
      const deliveryBox = new THREE.Mesh(deliveryBoxGeo, vespaMat);
      deliveryBox.position.set(-0.9, 1.25, 0);
      deliveryBox.castShadow = true;
      scooterRiderGroup.add(deliveryBox);

      // Black Padded Cushion Slats on Box
      for (let i = 0; i < 3; i++) {
        const slatGeo = new THREE.BoxGeometry(0.06, 0.15, 0.75);
        const slat = new THREE.Mesh(slatGeo, blackMat);
        slat.position.set(-0.33, 1.4 - i * 0.25, 0);
        scooterRiderGroup.add(slat);
      }

      // --- B. PIXAR TOY RIDER CHARACTER (PURPLE SHIRT, YELLOW HELMET, GREEN SHOES) ---
      const riderGroup = new THREE.Group();
      riderGroup.position.set(0.1, 0.55, 0);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 }); // Soft peach skin
      const purpleMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.5 }); // Vibrant Purple Shirt
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Mop Brown Hair
      const greenShoesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 }); // Green Sneakers

      // Purple Torso / T-Shirt
      const shirtGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.8, 16);
      const shirt = new THREE.Mesh(shirtGeo, purpleMat);
      shirt.position.set(0, 0.45, 0);
      shirt.castShadow = true;
      riderGroup.add(shirt);

      // Cute Rounded Head
      const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0.08, 1.1, 0);
      riderGroup.add(head);

      // Red Nose Dot (Pixar Toy Detail)
      const noseGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const noseMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0.38, 1.12, 0);
      riderGroup.add(nose);

      // Brown Toy Mop Hair
      const hairGeo = new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0.06, 1.18, 0);
      riderGroup.add(hair);

      // Yellow Pixar Helmet
      const helmetGeo = new THREE.SphereGeometry(0.36, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const helmet = new THREE.Mesh(helmetGeo, vespaMat);
      helmet.position.set(0.05, 1.25, 0);
      helmet.castShadow = true;
      riderGroup.add(helmet);

      // Black Visor Shield
      const visorGeo = new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI, Math.PI * 0.2, Math.PI * 0.35);
      const visor = new THREE.Mesh(visorGeo, blackMat);
      visor.rotation.y = Math.PI / 2;
      visor.position.set(0.05, 1.25, 0);
      riderGroup.add(visor);

      // Arms Holding Handlebars
      const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.65, 12);
      const armLeft = new THREE.Mesh(armGeo, purpleMat);
      armLeft.rotation.z = -1.1;
      armLeft.rotation.y = 0.3;
      armLeft.position.set(0.32, 0.58, 0.35);
      riderGroup.add(armLeft);

      const armRight = new THREE.Mesh(armGeo, purpleMat);
      armRight.rotation.z = -1.1;
      armRight.rotation.y = -0.3;
      armRight.position.set(0.32, 0.58, -0.35);
      riderGroup.add(armRight);

      // Chunky Green Retro Sneakers (Matching Reference Image)
      const shoeGeo = new THREE.BoxGeometry(0.42, 0.26, 0.26);
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

      const shoeLeftGroup = new THREE.Group();
      shoeLeftGroup.position.set(0.1, -0.18, 0.42);
      const shoeL = new THREE.Mesh(shoeGeo, greenShoesMat);
      const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.28), soleMat);
      soleL.position.y = -0.12;
      shoeLeftGroup.add(shoeL, soleL);
      riderGroup.add(shoeLeftGroup);

      const shoeRightGroup = new THREE.Group();
      shoeRightGroup.position.set(0.1, -0.18, -0.42);
      const shoeR = new THREE.Mesh(shoeGeo, greenShoesMat);
      const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.28), soleMat);
      soleR.position.y = -0.12;
      shoeRightGroup.add(shoeR, soleR);
      riderGroup.add(shoeRightGroup);

      scooterRiderGroup.add(riderGroup);
      shippingGroup.add(scooterRiderGroup);
      stageGroup.add(shippingGroup);

      return (delta: number, time: number) => {
        // Move road dashes
        dashesGroup.children.forEach((dash) => {
          dash.position.x -= delta * 6;
          if (dash.position.x < -4.5) dash.position.x += 9;
        });

        // Soft Pixar Scooter Bouncing & Wheel Rotation
        scooterRiderGroup.position.y = 0.65 + Math.sin(time * 6) * 0.04;
        wheelFront.rotation.z -= delta * 12;
        wheelBack.rotation.z -= delta * 12;
        riderGroup.rotation.z = Math.sin(time * 6) * 0.02;
      };
    };

    // =========================================================================
    // STAGE 4: Completed / Delivered (Pixar Toy House & Celebration Glow)
    // =========================================================================
    const buildStageCompleted = () => {
      const houseGroup = new THREE.Group();

      // White Toy House Body
      const houseGeo = new THREE.BoxGeometry(3.2, 2.4, 2.8);
      const houseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(0, 1.2, -0.5);
      house.castShadow = true;
      houseGroup.add(house);

      // Emerald Roof
      const roofGeo = new THREE.ConeGeometry(2.8, 1.3, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.3 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, 3.0, -0.5);
      roof.castShadow = true;
      houseGroup.add(roof);

      // Delivered Gift Parcel
      const giftGeo = new THREE.BoxGeometry(1.3, 1.0, 1.3);
      const giftMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
      const gift = new THREE.Mesh(giftGeo, giftMat);
      gift.position.set(0, 0.5, 1.3);
      gift.castShadow = true;
      houseGroup.add(gift);

      // Ribbon
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const rib1 = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.02, 0.2), ribbonMat);
      rib1.position.set(0, 0.5, 1.3);
      houseGroup.add(rib1);

      // Floating Gem Crystals
      const gemGroup = new THREE.Group();
      const gemGeo = new THREE.OctahedronGeometry(0.18);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
      });
      for (let i = 0; i < 6; i++) {
        const gem = new THREE.Mesh(gemGeo, gemMat);
        const angle = (i / 6) * Math.PI * 2;
        gem.position.set(Math.cos(angle) * 1.5, 1.3 + (i % 2) * 0.4, 1.3 + Math.sin(angle) * 0.8);
        gemGroup.add(gem);
      }
      houseGroup.add(gemGroup);

      stageGroup.add(houseGroup);

      return (delta: number, time: number) => {
        gift.position.y = 0.5 + Math.sin(time * 3) * 0.05;
        rib1.position.y = gift.position.y;
        gemGroup.rotation.y = time * 1.4;
      };
    };

    // =========================================================================
    // STAGE 5: Cancelled (Pastel Grey Toy Box & Red Cross Seal)
    // =========================================================================
    const buildStageCancelled = () => {
      const cancelGroup = new THREE.Group();

      const boxGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 1.15, 0);
      cancelGroup.add(box);

      const crossMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const bar1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, 0.22), crossMat);
      bar1.rotation.z = Math.PI / 4;
      bar1.position.set(0, 1.15, 1.12);
      cancelGroup.add(bar1);

      const bar2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, 0.22), crossMat);
      bar2.rotation.z = -Math.PI / 4;
      bar2.position.set(0, 1.15, 1.12);
      cancelGroup.add(bar2);

      stageGroup.add(cancelGroup);

      return (delta: number, time: number) => {
        box.rotation.y = Math.sin(time * 1.5) * 0.15;
      };
    };

    // Select Active Stage Builder
    let stageUpdater: ((delta: number, time: number) => void) | null = null;
    if (activeStage === "pending") {
      stageUpdater = buildStagePending();
    } else if (activeStage === "processing") {
      stageUpdater = buildStageProcessing();
    } else if (activeStage === "shipping") {
      stageUpdater = buildStageShipping();
    } else if (activeStage === "completed") {
      stageUpdater = buildStageCompleted();
    } else if (activeStage === "cancelled") {
      stageUpdater = buildStageCancelled();
    } else {
      stageUpdater = buildStagePending();
    }

    // Drag Rotation Controls
    let isDragging = false;
    let previousMouseX = 0;
    let targetRotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      targetRotationY += deltaX * 0.008;
      previousMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = "grab";
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 7. Animation Loop
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Rotation Lerp
      stageGroup.rotation.y += (targetRotationY - stageGroup.rotation.y) * 0.08;

      if (stageUpdater) {
        stageUpdater(delta, time);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
    };
  }, [activeStage]);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.03)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "1.75rem",
        padding: "8px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "calc(1.75rem - 0.375rem)",
          padding: "18px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header Title & Live 3D Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
                HÀNH TRÌNH ĐƠN HÀNG 3D TOY PIXAR
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Kéo chuột xoay 360° xem mô hình 3D Pixar cực dễ thương
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "#e0f2fe",
              color: "#0369a1",
              fontSize: "11px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <RotateCw className="w-3 h-3 animate-spin" /> Three.js Pixar 3D Live
          </div>
        </div>

        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "340px",
            borderRadius: "1.25rem",
            overflow: "hidden",
            background: "#fcfbf9",
            border: "1px solid #f1f5f9",
          }}
        />

        {/* 3D Stage Switcher Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "14px",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "pending", label: "1. Xác Nhận Đơn", icon: <Check className="w-3.5 h-3.5" /> },
            { key: "processing", label: "2. Chuẩn Bị Hàng", icon: <Box className="w-3.5 h-3.5" /> },
            { key: "shipping", label: "3. Ông Shipper Giao", icon: <Truck className="w-3.5 h-3.5" /> },
            { key: "completed", label: "4. Giao Thành Công", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ].map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setActiveStage(st.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 800,
                border: "none",
                background: activeStage === st.key ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                color: activeStage === st.key ? "#ffffff" : "#475569",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s ease",
              }}
            >
              {st.icon} {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
