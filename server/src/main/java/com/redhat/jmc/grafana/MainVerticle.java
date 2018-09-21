package com.redhat.jmc.grafana;

import static org.openjdk.jmc.common.unit.UnitLookup.NUMBER;

import java.io.File;
import java.util.Map;
import java.util.Map.Entry;

import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.Router;


import org.openjdk.jmc.common.item.IItem;
import org.openjdk.jmc.common.item.IItemCollection;
import org.openjdk.jmc.common.item.IItemIterable;
import org.openjdk.jmc.common.item.IMemberAccessor;
import org.openjdk.jmc.common.item.IType;
import org.openjdk.jmc.common.item.ItemFilters;
import org.openjdk.jmc.common.IDescribable;
import org.openjdk.jmc.common.item.Aggregators;
import org.openjdk.jmc.common.item.Attribute;
import org.openjdk.jmc.common.item.IAccessorKey;
import org.openjdk.jmc.common.item.IAttribute;
import org.openjdk.jmc.common.unit.IQuantity;
import org.openjdk.jmc.flightrecorder.JfrLoaderToolkit;

public class MainVerticle {

  public static final IAttribute<IQuantity> WORK_LEFT = Attribute.attr("workLeft", "MCCustomEventDemo$CustomEvent",
      NUMBER);

  public static void main(String[] args) {
    try {
      IItemCollection events = JfrLoaderToolkit.loadEvents(new File(args[0]));

      Vertx instance = Vertx.vertx();
      HttpServer server = instance.createHttpServer();
      Router router = Router.router(instance);

      IItemCollection customEvents = events.apply(ItemFilters.type("MCCustomEventDemo$CustomEvent"));
      for (IItemIterable itemIterable : customEvents) {
        IType<IItem> type = itemIterable.getType();
        IMemberAccessor<IQuantity, IItem> workAccessor = WORK_LEFT.getAccessor(type);

        for (IItem item : itemIterable) {
          System.out.println("ITEM: " + workAccessor.getMember(item).longValue());
        }
      }

      router.route().path("/").handler(routingContext -> {
        HttpServerResponse response = routingContext.response();
        response.end();
      });

      router.route().path("/search").handler(routingContext -> {
        HttpServerResponse response = routingContext.response();
        response.putHeader("content-type", "text/plain");
        response.end("");
      });

      router.route().path("/query").handler(routingContext -> {
        HttpServerResponse response = routingContext.response();
        response.putHeader("content-type", "text/plain");
        response.end("");
      });

      router.route().path("/annotations").handler(routingContext -> {
        HttpServerResponse response = routingContext.response();
        response.putHeader("content-type", "text/plain");
        response.end("");
      });

      server.requestHandler(router::accept);

      server.listen(8080);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
