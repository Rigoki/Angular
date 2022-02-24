import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Loader } from '@googlemaps/js-api-loader';


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {

  public monTitre: string;
  public monIntroduction: string;
  public maPhraseAccroche: string;
  public booleanCondition: boolean;
  public nbEnregistrements: number;
  public communes: any;
  public isAvailable: boolean;
  public objCommune: any;
  public objGeoCoord: any;
  public isAvailable2: boolean;



  champSaisi = new FormControl("");
  champValid = new FormControl("");
  //Fonction qui récupère les villes du département choisis.
  public afficherChampSaisi() {
    return this.http.get("https://geo.api.gouv.fr/departements/" + this.champSaisi.value.padStart(2, "0") + "/communes").subscribe((data) => {

      let json = JSON.parse(JSON.stringify(data));
      this.communes = [];
      this.nbEnregistrements = json.length;
      this.isAvailable = true;
      for (let i = 0; i < json.length; i++) {
        this.communes.push(json[i].nom);
      }
    });
  }
  //Fonction du clique validation
  public valider() {
    this.communesData();
    //Sert à afficher la liste et la carte qui sont par défaut caché !
    this.isAvailable2 = true;
  }

  //Fonction pour récupérer les informations de la commune
  public communesData() {
    this.http.get("https://api-adresse.data.gouv.fr/search/?q=" + this.champValid.value + "&type=municipality").subscribe((data) => {
      let json = JSON.parse(JSON.stringify(data));
      let mesData = json.features.filter((item: any) =>
        item.properties.citycode.includes(this.champSaisi.value.padStart(2, '0')) && (item.properties.city == this.champValid.value));
      let objData = {
        "city": mesData[0].properties.city,
        "population": mesData[0].properties.population,
        "postcode": mesData[0].properties.postcode
      }
      let objGeo = {
        "long": mesData[0].geometry.coordinates[0],
        "lat": mesData[0].geometry.coordinates[1],
      }
      this.objGeoCoord = objGeo;
      this.objCommune = objData;
      //Création de la carte
      let loader = new Loader({
        apiKey: "AIzaSyDUzmP-8_UCgGtZccTf4-ST71NxaGNF_kA"

      });

      loader.load().then(() => {
        new google.maps.Map(document.getElementById("map") as HTMLElement, {
          center: { lat: mesData[0].geometry.coordinates[1], lng: mesData[0].geometry.coordinates[0] },
          zoom: 14,
        })
      })

      return this.objCommune;
    });

  }
  constructor(private http: HttpClient) {
    this.monTitre = "Ma Commune";
    this.monIntroduction = "Informations sur les Communes";
    this.maPhraseAccroche = "Insérez le code du département";
    this.booleanCondition = false;
    this.communes = [];
    this.nbEnregistrements = 0;
    this.isAvailable = false;
    this.isAvailable2 = false;
  }

  ngOnInit(): void {

  }


}
