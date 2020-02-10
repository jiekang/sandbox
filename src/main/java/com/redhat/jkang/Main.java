package com.redhat.jkang;

import jdk.jfr.Description;
import jdk.jfr.Event;
import jdk.jfr.Label;

public class Main {

    @Label("MyEvent")
    @Description("Basic event")
    public static class MyEvent extends Event {
        @Label("Message")
        String message;
    }
    public static void main(String[] args) {
        MyEvent e = new MyEvent();
        e.message = "Hello World!";
        e.commit();
    }
}
