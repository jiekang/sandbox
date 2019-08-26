package controller

import (
	"github.com/jiekang/sandbox/jfr-web-operator/pkg/controller/containerjfr"
)

func init() {
	// AddToManagerFuncs is a list of functions to create controllers and add them to a manager.
	AddToManagerFuncs = append(AddToManagerFuncs, containerjfr.Add)
}
