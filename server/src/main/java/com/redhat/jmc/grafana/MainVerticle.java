package com.redhat.jmc.grafana;

import static org.openjdk.jmc.common.unit.UnitLookup.NUMBER;

import java.io.File;

import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;

import org.openjdk.jmc.common.item.Aggregators;
import org.openjdk.jmc.common.item.Attribute;
import org.openjdk.jmc.common.item.IAttribute;
import org.openjdk.jmc.common.item.IItemCollection;
import org.openjdk.jmc.common.item.ItemFilters;
import org.openjdk.jmc.common.unit.IQuantity;
import org.openjdk.jmc.flightrecorder.JfrLoaderToolkit;

public class MainVerticle {

  public static final IAttribute<IQuantity> WORK_LEFT = Attribute.attr("workLeft", "MCCustomEventDemo$CustomEvent", NUMBER);
  public static void main(String[] args) {
    try {
      IItemCollection events = JfrLoaderToolkit.loadEvents(new File(args[0]));
      IQuantity aggregate = events.apply(ItemFilters.type("MCCustomEventDemo$CustomEvent")).
              getAggregate(Aggregators.avg(WORK_LEFT));

      String content = "The average for the Java MCCustomEventDemo.workLeft " + aggregate.displayUsing("auto");


      HttpServer server = Vertx.vertx().createHttpServer();
      
      server.requestHandler(
        req -> req.response().end(content)
      );

      server.listen(8080);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
