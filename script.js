function getAvailability() {
  if (document.getElementById("pinCode").value == "") {
    return;
  }

  if (document.getElementById("date").value == "") {
    document.getElementById("date").value = moment().format("YYYY-MM-DD");
  }

  var dateText = document.getElementById("date").value;
  dateText = moment(dateText).format("DD-MM-YYYY");

  var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=201301&date=" +
    dateText;

  fetch(url)
    .then((response) => response.json())
    .then((data) => applyFilters(data))
    .then((data) => renderData("data", data));

    dateText = moment(dateText).add('days', 3).format("DD-MM-YYYY");
    var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=201301&date=" +
    dateText;

  fetch(url)
    .then((response) => response.json())
    .then((data) => applyFilters(data))
    .then((data) => renderData("data2", data));
}

function renderData(name, data) {
  console.log(data);
  var html = "";

  data.centers.forEach((center) => {
    html += "<div class='center'>";
    html += "<div class='center-info'>";
    html += "<div class='name'>" + center.name + "</div>";
    html +=
      "<div class='address'>" +
      center.address +
      ", " +
      center.block_name +
      "</div>";
    html += "</div>";

    html += "<div class='sessions'>";

    center.sessions.forEach((session) => {
      html +=
        "<a class='session' href='https://selfregistration.cowin.gov.in/appointment'>";
      html += "<div class='vaccine'>" + session.vaccine + "</div>";
      html += "<div class='date'>" + session.date + "</div>";
      html +=
        "<div class='min_age_limit'>Age Limit: " +
        session.min_age_limit +
        "</div>";
      html +=
        "<div class='available_capacity'><label>Capacity: </label> " +
        session.available_capacity +
        "</div>";
      html +=
        "<div class='available_capacity_dose1'><label>Dose 1: </label>" +
        session.available_capacity_dose1 +
        "</div>";
      html +=
        "<div class='available_capacity_dose1'><label>Dose 2: </label>" +
        session.available_capacity_dose2 +
        "</div>";
      html += "</a>";
    });

    html += "</div>";
    html += "</div>";
  });

  if (html == "") {
    html =
      "<h2 class='message'>Sorry, No slots available. Checked at: " +
      moment().format("hh:mm a") +
      "</h2>";
  }

  document.getElementById(name).innerHTML = html;
}

function applyFilters(data) {
  var age45 = $("#age45").is(":checked");
  var age18 = $("#age18").is(":checked");

  var centers = [];
  data.centers.forEach((center) => {
    var sessions = [];
    center.sessions.forEach((session) => {
      if (
        session.available_capacity_dose1 > 0 &&
        ((age18 && session.min_age_limit == 18) ||
          (age45 && session.min_age_limit == 45))
      ) {
        sessions.push(session);
      }
    });

    if (sessions.length > 0) {
      centers.push({ ...center, sessions: sessions });
    }
  });

  return { centers: centers };
}

setInterval(getAvailability, 5000);