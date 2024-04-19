import { List, ListItem, ListItemContent, ListItemDecorator } from '@mui/joy';
import { Home } from '@mui/icons-material';

export default (props: { logs: string[] , maxHeight?: string|number}) => {
  const { logs } = props;

  return <List sx={{ overflowY: 'auto', overFlowX: 'hidden', maxHeight: props.maxHeight }}>
    {
      logs.map((log: string, index) => <ListItem variant='soft' key={index}>
          <ListItemDecorator> <Home /> </ListItemDecorator>
          <ListItemContent>{log}</ListItemContent>
        </ListItem>
      )
    }
  </List>;
}
