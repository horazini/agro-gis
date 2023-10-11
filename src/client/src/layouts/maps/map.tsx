import { useEffect, useRef, useState } from "react";
import { MapContainer, Circle, Polygon, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter";

import L, { LatLngExpression } from "leaflet";
import { postLandplotSnapshot } from "../../services/services";

import { Button } from "@mui/material";

import { SentinelHubSnapshoter } from "../../components/mapcomponents";

const snapshotOptions = {
  hideElementsWithSelectors: [
    ".leaflet-control-container",
    ".leaflet-dont-include-pane",
    "#snapshot-button",
    "#time-controller",
  ],
  hidden: true,
};

const screenshotter = new SimpleMapScreenshoter(snapshotOptions);

const myPolygon = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-58, -27],
        [-59.2, -28],
        [-59, -27],
        [-58, -27],
      ],
    ],
  },
  properties: { name: "my polygon" },
};

const myCircle = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [-28, -58],
  },
  properties: {
    subType: "Circle",
    radius: 50000,
    name: "my circle",
  },
};

const MapView = () => {
  const [mapref, setMapref] = useState<any>(null);
  const featureRef = useRef<any>();
  const [tilesAreLoaded, setTilesAreLoaded] = useState<boolean>(false);
  const [snapshotButtonIsClicked, setSnapshotButtonIsClicked] =
    useState<boolean>(false);

  useEffect(() => {
    if (mapref) {
      screenshotter.addTo(mapref);
    }
  }, [mapref]);

  //#region snapshot trigger mechanism

  useEffect(() => {
    snapshotButtonIsClicked && tilesAreLoaded && TakeSnapshot();
  }, [snapshotButtonIsClicked, tilesAreLoaded]);

  const SnapshotClick = async () => {
    setSnapshotButtonIsClicked(true);
    mapref.setView(coords, 7);

    mapref.zoomControl.disable();
    mapref.dragging.disable();
    mapref.scrollWheelZoom.disable();
    mapref.touchZoom.disable();
    mapref.doubleClickZoom.disable();
    mapref.boxZoom.disable();
    mapref.keyboard.disable();
    // Alt to mapref.setView
    // mapref.fitBounds(feature.getBounds());
  };

  const TakeSnapshot = () => {
    const feature = featureRef.current;
    // Get bounds of feature
    const featureBounds = feature.getBounds();
    // Get pixel position on screen of top left and bottom right of the bounds of the feature
    const nw = featureBounds.getNorthWest();
    const se = featureBounds.getSouthEast();
    const topLeft = mapref.latLngToContainerPoint(nw);
    const bottomRight = mapref.latLngToContainerPoint(se);
    // Get the resulting image size that contains the feature
    const imageSize = bottomRight.subtract(topLeft);

    // timeout for the Leaflet loaded tiles white-to-color animation
    setTimeout(() => {
      screenshotter
        .takeScreen("image")
        .then((image: any) => {
          // Create <img> element to render img data
          var img = new Image();

          // once the image loads, do the following:
          img.onload = async () => {
            // Create canvas to process image data
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx === null) {
              return;
            }

            // Set canvas size to the size of your resultant image
            canvas.width = imageSize.x;
            canvas.height = imageSize.y;

            // Draw the Leaflet map bounding box image on the canvas
            ctx.drawImage(
              img,
              topLeft.x,
              topLeft.y,
              imageSize.x,
              imageSize.y,
              0,
              0,
              imageSize.x,
              imageSize.y
            );

            if (feature instanceof L.Polygon) {
              ctx.globalCompositeOperation = "destination-in";

              const coordinates = feature.getLatLngs()[0];

              if (!Array.isArray(coordinates)) {
                return;
              }
              // draw the polygon
              ctx.beginPath();
              coordinates.forEach((coord: any, index: number) => {
                const point = mapref.latLngToContainerPoint(
                  L.latLng(coord.lat, coord.lng)
                );
                const x = point.x - topLeft.x;
                const y = point.y - topLeft.y;
                if (index === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              });
              ctx.closePath();
              ctx.fill();
            } else if (feature instanceof L.Circle) {
              ctx.globalCompositeOperation = "destination-in";

              // get screen radius of the circle
              const rad = imageSize.x / 2;

              // get screen center of circle
              const x = rad; //- topLeft.x;
              const y = rad; //- topLeft.x;

              // draw the circle
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.fill();
            }

            const base64Canvas = canvas.toDataURL("image/png");
            console.log(base64Canvas);

            const myJson = {
              image: base64Canvas,
              name: "Ejemplo",
              landplot_id: 55,
              //crop_id: "",
              //crop_stage_id: "",
              date: "2023-10-02T03:00:00.000Z",
            };
            console.log(myJson);

            const res = await postLandplotSnapshot(myJson);
            console.log(res);
          };

          // set the image source to what the snapshotter captured
          // img.onload will fire AFTER this
          img.src = image;

          setSnapshotButtonIsClicked(false);
          mapref.zoomControl.enable();
          mapref.dragging.enable();
          mapref.scrollWheelZoom.enable();
          mapref.touchZoom.enable();
          mapref.doubleClickZoom.enable();
          mapref.boxZoom.enable();
          mapref.keyboard.enable();
        })
        .catch((e: { toString: () => any }) => {
          alert(e.toString());
        });
    }, 500);
  };

  //#endregion

  const coords = myCircle.geometry.coordinates as LatLngExpression;
  const { radius } = myCircle.properties;

  const LatLngsCoordinates: LatLngExpression[] =
    myPolygon.geometry.coordinates[0].map(([lng, lat]: number[]) => [lat, lng]);

  return (
    <MapContainer
      doubleClickZoom={false}
      id="mapId"
      zoom={7}
      center={{ lat: -29, lng: -58 }}
      preferCanvas={true}
      ref={setMapref}
    >
      <SentinelHubSnapshoter tilesAreLoaded={setTilesAreLoaded} />

      <Pane name="dont-include">
        <Polygon ref={featureRef} positions={LatLngsCoordinates} />

        <Circle ref={featureRef} center={coords} radius={radius} />
      </Pane>

      <div className={"leaflet-bottom leaflet-right"} id="snapshot-button">
        <div className="leaflet-control leaflet-bar">
          <Button
            variant="contained"
            color="inherit"
            sx={{ color: "black" }}
            disabled={snapshotButtonIsClicked}
            onClick={() => SnapshotClick()}
          >
            Tomar Snapshot
          </Button>
        </div>
      </div>
    </MapContainer>
  );
};

export default MapView;
