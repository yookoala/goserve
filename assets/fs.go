package assets

import (
	"bytes"
	"net/http"
)

const (
	TypeFile = iota
	TypeDir
)

// FileSystem returns a http.FileSystem of the assets
func FileSystem() (fs http.FileSystem) {
	return &fileSystem{}
}

type fileSystem struct {
}

// Open the given string or return error
func (fs *fileSystem) Open(name string) (f http.File, err error) {

	// test if is an unempty dir
	names, _ := AssetDir(name)
	if len(names) != 0 {
		f = &File{
			bytes.NewReader([]byte{}),
			name,
			TypeDir,
		}
		return
	}

	// test if is a file
	buf, err := Asset(name)
	if err != nil {
		return
	}

	f = &File{
		bytes.NewReader(buf),
		name,
		TypeFile,
	}
	return
}
