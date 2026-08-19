"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CheckCircle2, Truck, Package, Check, Sparkles, RotateCw, Box } from "lucide-react";

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
    const height = 320;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfbf9);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 0.8, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clean container before appending canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x2e7d32, 2, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // 5. Ground Shadow Plane
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
    });
    const shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Dynamic Group Container for Stage Models
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Track Animation Handles
    let animFrameId: number;
    let clock = new THREE.Clock();

    // Helper: Build Stage 1 (Pending / Order Placed Invoice & Seal Stamp)
    const buildStagePending = () => {
      // Paper Sheet
      const paperGeo = new THREE.BoxGeometry(2.2, 0.05, 3.2);
      const paperMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
      });
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.set(0, 1.2, 0);
      paper.castShadow = true;
      stageGroup.add(paper);

      // Textlines on paper
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
      for (let i = 0; i < 4; i++) {
        const lineGeo = new THREE.BoxGeometry(1.6, 0.06, 0.15);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(0, 1.24, -1 + i * 0.5);
        stageGroup.add(line);
      }

      // Green Confirmed Seal Stamp Badge
      const stampGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.2, 32);
      const stampMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        metalness: 0.3,
        roughness: 0.2,
      });
      const stamp = new THREE.Mesh(stampGeo, stampMat);
      stamp.position.set(0, 1.4, 0.4);
      stamp.castShadow = true;
      stageGroup.add(stamp);

      // Glowing Inner Ring
      const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x86efac });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 1.51, 0.4);
      stageGroup.add(ring);

      // Star Particles
      const particlesGroup = new THREE.Group();
      const particleGeo = new THREE.OctahedronGeometry(0.08);
      const particleMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        emissive: 0xca8a04,
      });
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(particleGeo, particleMat);
        const angle = (i / 8) * Math.PI * 2;
        p.position.set(Math.cos(angle) * 1.6, 1.5 + (i % 2) * 0.3, Math.sin(angle) * 1.6);
        particlesGroup.add(p);
      }
      stageGroup.add(particlesGroup);

      return (delta: number, time: number) => {
        paper.position.y = 1.2 + Math.sin(time * 2) * 0.08;
        stamp.position.y = paper.position.y + 0.16;
        ring.position.y = paper.position.y + 0.27;
        particlesGroup.rotation.y = time * 0.8;
      };
    };

    // Helper: Build Stage 2 (Processing / Cardboard Box Warehouse & Tape Machine)
    const buildStageProcessing = () => {
      // Conveyor Belt Frame
      const beltGeo = new THREE.BoxGeometry(4.5, 0.2, 1.8);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, 0.1, 0);
      belt.receiveShadow = true;
      stageGroup.add(belt);

      // Cardboard Box
      const boxGeo = new THREE.BoxGeometry(2, 1.6, 2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 1.0, 0);
      box.castShadow = true;
      stageGroup.add(box);

      // Green Tape Sealer Roll
      const tapeGeo = new THREE.BoxGeometry(2.05, 0.06, 0.3);
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.set(0, 1.84, 0);
      stageGroup.add(tape);

      // Barcode Label Sticker
      const labelGeo = new THREE.BoxGeometry(0.02, 0.6, 0.8);
      const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(1.02, 1.0, 0);
      stageGroup.add(label);

      return (delta: number, time: number) => {
        box.position.y = 1.0 + Math.abs(Math.sin(time * 3)) * 0.05;
        tape.position.y = box.position.y + 0.84;
        label.position.y = box.position.y;
      };
    };

    // Helper: Build Stage 3 (Shipping / Moving Shipper & Scooter Road)
    const buildStageShipping = () => {
      // Road Strip
      const roadGeo = new THREE.BoxGeometry(8, 0.08, 2.4);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.04, 0);
      road.receiveShadow = true;
      stageGroup.add(road);

      // Moving White Lane Markers
      const dashesGroup = new THREE.Group();
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let i = -4; i <= 4; i += 2) {
        const dashGeo = new THREE.BoxGeometry(0.8, 0.09, 0.15);
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.position.set(i, 0.05, 0);
        dashesGroup.add(dash);
      }
      stageGroup.add(dashesGroup);

      // Scooter Body Group
      const scooter = new THREE.Group();
      scooter.position.set(0, 0.6, 0);

      // Main Chassis
      const chassisGeo = new THREE.BoxGeometry(2.4, 0.4, 0.8);
      const chassisMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.castShadow = true;
      scooter.add(chassis);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const wheelFront = new THREE.Mesh(wheelGeo, wheelMat);
      wheelFront.rotation.x = Math.PI / 2;
      wheelFront.position.set(0.9, -0.3, 0);
      scooter.add(wheelFront);

      const wheelBack = new THREE.Mesh(wheelGeo, wheelMat);
      wheelBack.rotation.x = Math.PI / 2;
      wheelBack.position.set(-0.9, -0.3, 0);
      scooter.add(wheelBack);

      // Cargo Box on Back Rack
      const cargoGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      const cargoMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const cargoBox = new THREE.Mesh(cargoGeo, cargoMat);
      cargoBox.position.set(-0.6, 0.7, 0);
      cargoBox.castShadow = true;
      scooter.add(cargoBox);

      // Shipper Helmet Figure
      const helmetGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
      const helmet = new THREE.Mesh(helmetGeo, helmetMat);
      helmet.position.set(0.4, 0.8, 0);
      scooter.add(helmet);

      stageGroup.add(scooter);

      return (delta: number, time: number) => {
        // Move road dashes to simulate speed
        dashesGroup.children.forEach((dash) => {
          dash.position.x -= delta * 5;
          if (dash.position.x < -4) dash.position.x += 8;
        });

        // Bouncing Scooter Animation
        scooter.position.y = 0.6 + Math.sin(time * 12) * 0.03;
        wheelFront.rotation.z -= delta * 12;
        wheelBack.rotation.z -= delta * 12;
      };
    };

    // Helper: Build Stage 4 (Completed / Delivered House & Unboxing Glow)
    const buildStageCompleted = () => {
      // House Body
      const houseGeo = new THREE.BoxGeometry(3, 2.2, 2.6);
      const houseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(0, 1.1, -0.5);
      house.castShadow = true;
      stageGroup.add(house);

      // Green Roof
      const roofGeo = new THREE.ConeGeometry(2.6, 1.2, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, 2.8, -0.5);
      roof.castShadow = true;
      stageGroup.add(roof);

      // Delivered Parcel Box on Porch
      const parcelGeo = new THREE.BoxGeometry(1.2, 0.9, 1.2);
      const parcelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const parcel = new THREE.Mesh(parcelGeo, parcelMat);
      parcel.position.set(0, 0.45, 1.2);
      parcel.castShadow = true;
      stageGroup.add(parcel);

      // Glowing Diamond Gems
      const gemGroup = new THREE.Group();
      const gemGeo = new THREE.OctahedronGeometry(0.18);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x86efac,
        emissive: 0x22c55e,
        roughness: 0.1,
      });
      for (let i = 0; i < 6; i++) {
        const gem = new THREE.Mesh(gemGeo, gemMat);
        const angle = (i / 6) * Math.PI * 2;
        gem.position.set(Math.cos(angle) * 1.4, 1.2 + (i % 2) * 0.4, 1.2 + Math.sin(angle) * 0.8);
        gemGroup.add(gem);
      }
      stageGroup.add(gemGroup);

      return (delta: number, time: number) => {
        parcel.position.y = 0.45 + Math.sin(time * 3) * 0.04;
        gemGroup.rotation.y = time * 1.2;
      };
    };

    // Helper: Build Stage 5 (Cancelled)
    const buildStageCancelled = () => {
      const boxGeo = new THREE.BoxGeometry(2, 1.6, 2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 1.0, 0);
      stageGroup.add(box);

      // Red X Mark Cross
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const bar1Geo = new THREE.BoxGeometry(1.8, 0.2, 0.2);
      const bar1 = new THREE.Mesh(bar1Geo, crossMat);
      bar1.rotation.z = Math.PI / 4;
      bar1.position.set(0, 1.0, 1.02);
      stageGroup.add(bar1);

      const bar2Geo = new THREE.BoxGeometry(1.8, 0.2, 0.2);
      const bar2 = new THREE.Mesh(bar2Geo, crossMat);
      bar2.rotation.z = -Math.PI / 4;
      bar2.position.set(0, 1.0, 1.02);
      stageGroup.add(bar2);

      return (delta: number, time: number) => {
        box.rotation.y = Math.sin(time) * 0.15;
      };
    };

    // Select Stage Builder
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

    // Interactive Drag Orbit System
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
      stageGroup.rotation.y += (targetRotationY - stageGroup.rotation.y) * 0.1;

      if (stageUpdater) {
        stageUpdater(delta, time);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    // Clean up Three.js WebGL context on unmount
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
                HÀNH TRÌNH ĐƠN HÀNG 3D INTERACTIVE
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Kéo chuột để xoay 360° quan sát mô hình 3D thời gian thực
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
            <RotateCw className="w-3 h-3 animate-spin" /> Three.js 3D WebGL Live
          </div>
        </div>

        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "320px",
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
