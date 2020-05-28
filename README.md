# sandbox
Random code playground

# Reproducer for EAPSUP-143


## Run 

Build results are included in the commit so building is not necessary. Build instructions are provided further below for reproduction purposes.

Let java = jdk8 binary, java11 = jdk8 binary

```
$ java -Xbootclasspath/a:./test.jar -jar main.jar
```

Result:

```
Hello World! sun.security.jgss.GSSManagerImpl@4b67cf4d
java.lang.ClassNotFoundException: com.redhat.jkang.module.Mod
	at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:418)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:352)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:351)
	at java.lang.Class.forName0(Native Method)
	at java.lang.Class.forName(Class.java:264)
	at com.redhat.jkang.Main.main(Main.java:13)
Test: sun.security.jgss.GSSManagerImpl@29453f44
```

```
$ java11 -Xbootclasspath/a:./test.jar -jar main.jar
```

Result:

```
Hello World! sun.security.jgss.GSSManagerImpl@728938a9
java.lang.ClassNotFoundException: com.redhat.jkang.module.Mod
	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:581)
	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:178)
	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:522)
	at java.base/java.lang.Class.forName0(Native Method)
	at java.base/java.lang.Class.forName(Class.java:315)
	at com.redhat.jkang.Main.main(Main.java:13)
java.lang.reflect.InvocationTargetException
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.base/java.lang.reflect.Method.invoke(Method.java:566)
	at com.redhat.jkang.Main.main(Main.java:23)
Caused by: java.lang.NoClassDefFoundError: org/ietf/jgss/GSSManager
	at com.redhat.jkang.Test.call(Test.java:7)
	... 5 more
```

```
$ java11 --module-path ./modules/ --add-modules com.redhat.jkang.module -jar main.jar
```

Result:

```
Hello World! sun.security.jgss.GSSManagerImpl@4629104a
Mod: sun.security.jgss.GSSManagerImpl@61e4705b
java.lang.ClassNotFoundException: com.redhat.jkang.Test
	at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:581)
	at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:178)
	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:522)
	at java.base/java.lang.Class.forName0(Native Method)
	at java.base/java.lang.Class.forName(Class.java:315)
	at com.redhat.jkang.Main.main(Main.java:21)
```

## Build

The Main and Test java files are under `src/main/java` and can be built into jars manually or via modification to pom.xml to include/exclude classes and `mvn clean verify`

The module is under `src/main/module` and can be built into a jar manually with jdk11:

```
$ javac -d out --module-source-path ./src/main/module/ --module com.redhat.jkang.module
$ jar -c --file=com-redhat-jkang-module.jar -C out/com.redhat.jkang.module/ .
$ mkdir -p modules && mv com-redhat-jkang-module.jar ./modules
```
