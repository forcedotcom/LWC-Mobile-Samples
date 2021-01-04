import { LightningElement } from "lwc";

export default class HelloWorld extends LightningElement {
  username = new URLSearchParams(window.location.search).get("username");
}
