An idea that follows from [lines to 3D](/blog/ai/lines-to-3d/): a real-world use for it.

## The idea

Send a small fleet of drones through a home, each one carrying a high-resolution 360° camera. They fly the rooms, avoid obstacles, and come back in a minute or two. Out comes a **full 3D model of the space.**

## Why it could be a business

- **Real estate listings:** walk-throughs buyers can explore, made in minutes.
- **Remodelling and planning:** real measurements, ready for a designer before anyone pulls out a tape measure.
- **Rentals and apartments:** every unit scanned the same way, quickly and cheaply.

Systems like Matterport already do room scans, from a camera on a tripod moved by hand, and the results are rough. Drones change the cost: no operator walking room to room, and four drones splitting a house finish in the time one would take for a single floor.

## How it would work

1. **Fly:** each drone takes a share of the rooms, with obstacle avoidance. 360° drones exist, and indoor-capable autonomous drones exist; together they cover every wall in one pass.
2. **Capture:** high-resolution 360° video, so every surface is seen from several positions.
3. **Rebuild:** the [lines-to-3D](/blog/ai/lines-to-3d/) pipeline. Line art, then corners, then a vector drawing, then the camera placed from vanishing points, then planes for walls, floors and ceilings. Many frames from many positions pin each wall down far better than a single photo can.
4. **Finish:** add textures, materials and lighting from the same video.

## The rule that matters

Scan what's there; don't invent what isn't. If a drone never entered a room, the model leaves it empty, or marks a guess clearly as a guess. A listing has to be honest.

## Open questions

- Indoor flight safety: people, pets, glass, mirrors.
- How many drones, and how small, before the scan quality drops.
- Whether a cheap 360° camera gives enough resolution for measurements, or only for looks.
