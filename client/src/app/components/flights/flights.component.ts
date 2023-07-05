import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit {
  from: any = "";
  fromLocation: any = [];
  origin: any;
  fromLocationTemplate: boolean = true;
  toLocationTemplate: boolean = false;
  history: any = [];

  constructor() { }

  ngOnInit() {
    this.handleHistory();
  }

  handleFromLocation() {
    if (this.from.length > 3) {
      fetch(`http://localhost:5000/city-and-airport-search/${this.from}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:qwe12345')
        }
      })
      .then(response => response.json())
      .then(data => this.fromLocation = data.data);
    }
  }

  handleHistory() {
    fetch(`http://localhost:5000/history-search`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:qwe12345')
        }
    })
    .then(response => response.json())
    .then(data => this.history = data.data);
  }

  onClearHistory() {
    fetch(`http://localhost:5000/history-clear`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:qwe12345')
        }
    })
    .then(response => response.json())
    window.location.reload();
  }

  handleOrigin(location: any) {
    this.origin = location;
    this.fromLocationTemplate = false;
    this.toLocationTemplate = true;
    this.fromLocation = [];
  }

  to: any = "";
  destination: any;
  toLocation: any = [];
  departureDateTemplate: boolean = false;

  handleToLocation() {
    if (this.to.length > 3) {
      fetch(`http://localhost:5000/city-and-airport-search/${this.to}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:qwe12345')
        }
      })
      .then(response => response.json())
      .then(data => this.toLocation = data.data);
    }
  }

  handleDestination(location: any) {
    this.destination = location;
    this.toLocationTemplate = false;
    this.toLocation = [];
    this.departureDateTemplate = true;
  }

  date: any = "";
  flights: any;
  flightTemplate: boolean = false

  onFindFlight() {
    if (this.date == "") {
      alert("Please choose a date")
    } else {
      fetch(`http://localhost:5000/flight-search?originCode=${this.origin.iataCode}&destinationCode=${this.destination.iataCode}&dateOfDeparture=${this.date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:qwe12345')
      }
      })
      .then(response => response.json())
      .then(data => {
        this.flights = data.data
        console.log(this.flights)
        this.departureDateTemplate = false
        this.flightTemplate = true
      })
      .catch((error) => {
        alert(error)
      });
    }
  }

    booked: boolean = false
    first: string = "";
    last: string= "";

    onBookFlight(flight: any) {
        if (this.first == "" && this.last == "") {
          alert("Enter your first and last name")
          return;
        }
        const data = { flight: flight };
        const name = {
          first: this.first,
          last: this.last
        }
        const dataForBookingFlight = { flight: flight, name: name }
        fetch('http://localhost:5000/flight-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:qwe12345'),
          },
          body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(dataObject => {
          console.log('Success:', dataObject.data.flightOffers);
          const data = { flight: flight };
          console.log(data);
          fetch('http://localhost:5000/flight-booking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa('admin:qwe12345'),
            },
            body: JSON.stringify(dataForBookingFlight),
          })
          .then(response => {}
            //response.json()
            )
          .then(data => {
            console.log('Success:', data);
            this.booked  = true;
            this.flightTemplate = false
            this.flights = []
          })
          .catch((error) => {
            alert(error)
          });
        })
        .catch((error) => {
          console.error('Error:', error);
          alert(error)
        });
  }
}
