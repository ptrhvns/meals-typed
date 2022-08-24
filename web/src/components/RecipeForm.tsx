import {
  Alert,
  Box,
  Button,
  createStyles,
  LoadingOverlay,
  Text,
  TextInput,
} from "@mantine/core";
import {
  faCircleExclamation,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forOwn, head, pick } from "lodash";
import { useApi } from "../hooks/useApi";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const useStyles = createStyles(() => ({
  wrapper: {
    position: "relative",
  },
}));

function RecipeForm() {
  const [alert, setAlert] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { classes } = useStyles();
  const { post } = useApi();

  const form = useForm({
    initialValues: {
      title: "",
    },
  });

  return (
    <Box className={classes.wrapper}>
      <LoadingOverlay visible={submitting} />

      <form
        onSubmit={form.onSubmit(async (values) => {
          setSubmitting(true);

          const response = await post({
            data: pick(values, ["title"]),
            route: "recipeCreate",
          });

          setSubmitting(false);

          if (response.isError) {
            setAlert(response.message);

            forOwn(response.errors, (value, key) =>
              form.setFieldError(key, head(value))
            );

            return;
          }

          navigate(`/recipe/${response.data.id}`, { replace: true });
        })}
      >
        {alert && (
          <Alert
            color="red"
            icon={<FontAwesomeIcon icon={faCircleExclamation} />}
            mt="md"
            onClose={() => setAlert(undefined)}
            withCloseButton
          >
            {alert}
          </Alert>
        )}

        <TextInput
          disabled={submitting}
          label="Title"
          mt="md"
          {...form.getInputProps("title")}
        />

        <Button disabled={submitting} mt="xl" type="submit">
          <FontAwesomeIcon icon={faCirclePlus} />
          <Text ml="xs">Save and continue</Text>
        </Button>
      </form>
    </Box>
  );
}

export default RecipeForm;