import React, { Component, Fragment } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import PropTypes from 'prop-types';
import {
  FormControl,
  TextField,
  Typography,
  MenuItem,
  Button,
  Checkbox,
  InputLabel,
  ListItemText,
  Select
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import {
  updateItem,
  resetItem,
  resetImage
} from '../../redux/modules/ShareItem';
import { connect } from 'react-redux';
import validate from './helpers/validation';

class ShareItemForm extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {
      fileSelected: false,
      done: false,
      selectedTags: []
    };
  }
  applyTags(tags) {
    return (
      tags &&
      tags
        .filter(t => this.state.selectedTags.indexOf(t.id) >= 0)
        .map(t => ({ title: t.title, id: t.id }))
    );
  }

  getBase64Url() {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve(
          `data:${this.state.fileSelected.type};base64, ${btoa(
            e.target.result
          )}`
        );
      };
      reader.readAsBinaryString(this.state.fileSelected);
    });
  } // converts file into base64 string

  dispatchUpdate(values, tags, updateItem) {
    if (!values.imageurl && this.state.fileSelected) {
      this.getBase64Url().then(imageurl => {
        updateItem({
          imageurl
        });
      });
    }
    updateItem({
      ...values,
      tags: this.applyTags(tags)
    });
  }

  handleSelectFile = () => {
    this.setState({ fileSelected: this.fileInput.current.files[0] });
  };

  handleSelectTags = event => {
    this.setState({ selectedTags: event.target.value });
  };

  generateTagsText(tags, selected) {
    return tags
      .map(tag => (selected.indexOf(tag.id) > -1 ? tag.title : false))
      .filter(e => e)
      .join(', ');
  }

  render() {
    const { classes, tags, updateItem, resetImage, resetItem } = this.props;
    console.log(tags);
    return (
      <div>
        <Typography className={classes.header}>Share. Borrow. Grow.</Typography>

        <Form
          onSubmit={e => {}}
          validate={values => {
            return validate(
              values,
              this.state.selectedTags,
              this.state.fileSelected
            );
          }}
          render={({ handleSubmit, pristine, submitting, invalid }) => (
            // <Mutation mutation={ADD_ITEM_MUTATION}>
            // </Mutation>
            <form onSubmit={handleSubmit}>
              <FormSpy
                subscription={{ values: true }}
                component={({ values }) => {
                  if (values) {
                    this.dispatchUpdate(values, tags, updateItem);
                  }
                  return '';
                }}
              />
              <label htmlFor="contained-button-file">
                {!this.state.fileSelected ? (
                  <Button
                    className={classes.imageButton}
                    variant="contained"
                    component="span"
                    onClick={() => {
                      this.fileInput.current.click();
                    }}
                  >
                    select an image
                  </Button>
                ) : (
                  <Button
                    className={classes.resetImage}
                    // variant="contained"
                    // component="span"
                    onClick={() => {
                      this.fileInput.current.value = '';
                      this.setState({ fileSelected: false });
                      resetImage();
                    }}
                  >
                    reset image
                  </Button>
                )}

                <input
                  hidden
                  type="file"
                  id="fileInput"
                  ref={this.fileInput}
                  accept="image/*"
                  onChange={() => {
                    this.handleSelectFile();
                  }}
                />
              </label>

              <Field
                name="title"
                render={({ input, meta }) => {
                  return (
                    <div className="field" width="100%">
                      <TextField
                        className={classes.textField}
                        id="standard-textarea"
                        label="Name your item"
                        margin="normal"
                        {...input}
                      />
                      {meta.touched &&
                        meta.invalid && (
                          <div
                            className="error"
                            style={{ color: 'red', fontsize: '10px' }}
                          >
                            {meta.error}
                          </div>
                        )}
                    </div>
                  );
                }}
              />

              <Field
                name="description"
                render={({ input, meta }) => {
                  return (
                    <div>
                      <TextField
                        className={classes.textField}
                        id="filled-description"
                        placeholder="Describe your item"
                        multiline
                        rows="4"
                        {...input}
                      />
                      {meta.touched &&
                        meta.invalid && (
                          <div
                            className="error"
                            style={{ color: 'red', fontsize: '10px' }}
                          >
                            {meta.error}
                          </div>
                        )}
                    </div>
                  );
                }}
              />

              <Field
                name="tags"
                render={({ input, meta }) => (
                  <FormControl className={classes.formControl}>
                    <InputLabel
                      className={classes.dropDown}
                      htmlFor="select-multiple-checkbox"
                    >
                      Add some tags
                    </InputLabel>
                    <Select
                      className={classes.menu}
                      multiple
                      onChange={this.handleSelectTags}
                      renderValue={selected => {
                        return this.generateTagsText(tags, selected);
                      }}
                      value={this.state.selectedTags}
                    >
                      {tags &&
                        tags.map(tag => (
                          <MenuItem key={tag.id} value={tag.id}>
                            <Checkbox
                              checked={
                                this.state.selectedTags.indexOf(tag.id) > -1
                              }
                            />
                            <ListItemText>{tag.title}</ListItemText>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Button
                className={classes.shareButton}
                type="submit"
                disabled={pristine || submitting || invalid}
              >
                Share
              </Button>
            </form>
          )}
        />
      </div>
    );
  }
}
ShareItemForm.propTypes = {
  classes: PropTypes.object.isRequired
};

const mapDispatchToProps = dispatch => ({
  updateItem(item) {
    dispatch(updateItem(item));
  },
  resetItem() {
    dispatch(resetItem());
  },
  resetImage() {
    dispatch(resetImage());
  }
});

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(ShareItemForm));
