let csvs = window.location.search.split("csv=")
if ((csvs).length > 1) {
  csvs = csvs[1].split("&")[0].split(",");
  console.log(csvs);
} else {
  // alert("add csv= to the URL for file names")
  csvs = ["medfacil","parking_with_geo"];
}

function initMap() {
  let styledMapType = new google.maps.StyledMapType([
      {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.station.rail",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "transit.station.rail",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "weight": 1
          }
        ]
      },
      {
        "featureType": "transit.station.rail",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      }
    ],
    { name: "Boston Style"}
  );

  let map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.3331338, lng: -71.1137929 },
    zoom: 12,
    streetViewControl: false
  });
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  let info = new google.maps.InfoWindow();
  // map.data.setStyle((feature) => {
  //   return {
  //     strokeColor: '#00f',
  //     fillColor: (feature.getProperty('level') === 'ward' ? '#f00' : '#00f'),
  //     opacity: 0.5,
  //     fillOpacity: 0.25,
  //     clickable: false
  //   };
  // });

  csvs.forEach(csv => {
    fetch("./csvs/" + csv + ".csv").then(res => res.text()).then((txt) => {
      let rows = Papa.parse(txt, {header:true}),
          locationField = false;
      rows.data.forEach(row => {
        if (row.Location) {
            row.location = row.Location;
            delete row.Location;
        }
        if (locationField ||
            (row.location
            && row.location.replace(/\s/g, '').includes("(42")
            && row.location.replace(/\s/g, '').includes(",-71"))) {
            locationField = true;
            let latlng = row.location.split('\n').splice(-1)[0].replace('(', '').replace(')', '').split(',');
            row.latitude = latlng[0];
            row.longitude = latlng[1];
            delete row.location;
        }
        if (row.latitude * 1 && row.longitude * 1) {
          let marker = new google.maps.Marker({
            map: map,
            clickable: true,
            position: new google.maps.LatLng(row.latitude * 1, row.longitude * 1)
          });
          let showMarker = (matches) => {
            let table = '<table class="table"><thead><tr>';
            table += Object.keys(matches[0]).map(col => {
              if (col !== 'latitude' && col !== 'longitude' && col !== "XCOORD" && col !== "YCOORD") {
                return '<th>' + col + '</th>';
              }
            }).join("");
            table += '</tr></thead><tbody>';
            table += matches.map(match => {
              let htmlrow = '<tr>';
              Object.keys(match).forEach(col => {
                if (col !== 'latitude' && col !== 'longitude') {
                  row[col] = match[col];
                  htmlrow += '<td>' + match[col] + '</td>';
                }
              });
              return htmlrow + '</tr>';
            });
            table += '</tbody></table>';
            info.setContent(table);
            info.open(map, marker);
          };
          marker.addListener('click', function(e) {
            info.close();
            // if (Object.keys(row).length === 2) {
            //   fetch("/api?mapid=" + mapid + "&x=" + row.latitude + "&y=" + row.longitude)
            //     .then(res => res.json())
            //     .then(showMarker);
            // } else {
            //   showMarker([row]);
            // }
            showMarker([row]);
          });
        }
      });
    });
  });
}
