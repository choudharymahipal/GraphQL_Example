import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { gql, Apollo } from 'apollo-angular';
import { countryData } from './Models/countryData';

const Get_CountryList = gql`
{
  countries{
    name
    code
    capital
    currency
    emoji
    native
  }
}
`;

const Search_Country = gql`
query country($code:ID!){
  country(code: $code){
    name
    code
    capital
    currency
    emoji
    native
  }
}
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  displayedColumns: string[] = ['Name', 'Code', 'Capital', 'Currency', 'Emoji', 'Native'];
  dataSource!: MatTableDataSource<countryData>;
  SearchDropDownData!: countryData[];
  SearchObj!: countryData[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  myform!: FormGroup;
  IsLoading: boolean = false;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    this.myform = fb.group({
      Search: [null, Validators.required]
    })
  }

  ngOnInit(): void {
    this.GetCountry();
  }

  GetCountry() {
    this.IsLoading = true;
    this.apollo.watchQuery<any>({
      query: Get_CountryList
    }).valueChanges.subscribe(({ data, loading }) => {
      this.SearchDropDownData = data.countries;
      this.dataSource = new MatTableDataSource(data.countries);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.IsLoading = false;

    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  OnSearch(data: any) {
    this.IsLoading = true;
    if (data.Search) {
      this.apollo.watchQuery<any>({
        query: Search_Country,
        variables: {
          "code": data.Search
        }
      }).valueChanges.subscribe(({ data, loading }) => {
        const arr: countryData[] = [];
        const a1: countryData = {
          "name": data.country.name,
          "code": data.country.code,
          "capital": data.country.capital,
          "currency": data.country.currency,
          "emoji": data.country.emoji,
          "native": data.country.native
        }
        arr.push(a1);
        this.dataSource = new MatTableDataSource(arr);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.IsLoading = false;
      })
    } else {
      this.IsLoading = false;
      this.snackbar.open("Please select country name", "Close", {
        duration: 2000
      })
    }
  }

  OnReset() {
    this.myform.reset();
    this.GetCountry();
  }


}
