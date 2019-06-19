import {Component, Type, OnInit, OnDestroy} from '@angular/core';
import { MessageService } from '../services/message.service';
@Component({
  selector: 'login-bar',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private messageService: MessageService) { }
  serviceData = [];

   ngOnInit() {
     this.messageService.getServiceData().subscribe(res => {
      this.serviceData = res;
    });
    setInterval(() => {
        this.messageService.getServiceData().subscribe(res => {
         this.serviceData = res;
        });
                }, 5000);
    }
}
